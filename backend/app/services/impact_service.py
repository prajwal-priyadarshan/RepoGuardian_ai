import os
import tempfile
from pathlib import Path
from neo4j import GraphDatabase
from dotenv import load_dotenv
from app.services import parser_service

from app.services import git_service

def detect_change(repo_id: str) -> dict:
    base_path = Path("data/repos") / repo_id
    
    # Get git diff for the repo (this will now automatically git pull from GitHub!)
    diff_text = git_service.get_diff(str(base_path))
    
    # Extract changed Python functions using git_service
    changed_funcs = git_service.extract_changed_functions(diff_text)
    
    # Since the basic git diff extraction doesn't distinguish easily between added/removed/modified
    # in this regex setup, we just put everything into "modified".
    return {
        "added": [],
        "removed": [],
        "modified": changed_funcs,
        "raw_diff": diff_text
    }

def analyze_impact(function_name: str, repo_id: str) -> dict:
    load_dotenv(override=True)
    neo4j_uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    neo4j_user = os.getenv("NEO4J_USER", "neo4j")
    neo4j_password = os.getenv("NEO4J_PASSWORD", "password")
    
    driver = GraphDatabase.driver(neo4j_uri, auth=(neo4j_user, neo4j_password))
    
    affected_files = set()
    try:
        with driver.session() as session:
            # 1. Find the file where this entity (Function/Class) is defined
            query1 = """
            MATCH (n {name: $name, repo_id: $repo_id})-[:DEFINED_IN]->(file:File)
            WHERE n:Function OR n:Class
            RETURN file.name AS file_name
            """
            res = session.run(query1, name=function_name, repo_id=repo_id)
            for record in res:
                affected_files.add(record["file_name"])
                
            # 2. Find any files that IMPORT the file where the entity is defined
            query2 = """
            MATCH (n {name: $name, repo_id: $repo_id})-[:DEFINED_IN]->(file:File)
            WHERE n:Function OR n:Class
            MATCH (other:File {repo_id: $repo_id})-[:IMPORTS]->(file)
            RETURN other.name AS dep_file
            """
            res_deps = session.run(query2, name=function_name, repo_id=repo_id)
            for record in res_deps:
                affected_files.add(record["dep_file"])
    finally:
        driver.close()
        
    return {
        "function": function_name,
        "affected_files": list(affected_files)
    }

from app.services import embedding_service

def get_context(function_name: str, repo_id: str) -> list[str]:
    return embedding_service.query_embeddings(function_name, repo_id)

from app.services import embedding_service, static_analysis_service

def get_dependency_depth(function_name: str, repo_id: str) -> int:
    """Calculates the maximum depth of the dependency chain in the graph."""
    load_dotenv(override=True)
    neo4j_uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    neo4j_user = os.getenv("NEO4J_USER", "neo4j")
    neo4j_password = os.getenv("NEO4J_PASSWORD", "password")
    
    driver = GraphDatabase.driver(neo4j_uri, auth=(neo4j_user, neo4j_password))
    depth = 0
    try:
        with driver.session() as session:
            # Find the longest path of CALLS or IMPORTS leading to this entity
            query = """
            MATCH p = (other)-[:CALLS|IMPORTS*]->(target {name: $name, repo_id: $repo_id})
            RETURN length(p) as d
            ORDER BY d DESC LIMIT 1
            """
            res = session.run(query, name=function_name, repo_id=repo_id)
            record = res.single()
            if record:
                depth = record["d"]
    finally:
        driver.close()
    return depth

def calculate_risk_score(affected_nodes: int, depth: int, entity_name: str) -> float:
    """Risk = (affected_nodes × depth × criticality)"""
    # Heuristic for criticality
    critical_keywords = ["auth", "payment", "login", "db", "security", "config"]
    criticality = 1.5 if any(kw in entity_name.lower() for kw in critical_keywords) else 1.0
    
    return float(affected_nodes * (depth + 1) * criticality)

def run_impact_analysis(repo_id: str) -> dict:
    changes = detect_change(repo_id)
    
    # 1. Run Static Analysis on the diff
    static_issues = static_analysis_service.analyze_changes(changes.get("raw_diff", ""))
    
    impacts = []
    # Analyze impact for all potentially changed functions
    changed_funcs = changes["added"] + changes["removed"] + changes["modified"]
    
    for func in changed_funcs:
        impact = analyze_impact(func, repo_id)
        
        # Get depth for risk scoring
        depth = get_dependency_depth(func, repo_id)
        
        # Calculate Risk Score (Phase 7 Gap)
        affected_count = len(impact["affected_files"])
        impact["risk_score"] = calculate_risk_score(affected_count, depth, func)
        impact["depth"] = depth
        
        # Get semantic context from Pinecone Vector DB
        try:
            semantic_context = get_context(func, repo_id)
            impact["semantic_context"] = semantic_context
        except Exception:
            impact["semantic_context"] = []
            
        # Add static issues to each impact context for AI reasoning
        impact["static_issues"] = static_issues
            
        # Add to output if we found graph files or semantic context
        if impact["affected_files"] or impact.get("semantic_context"):
            impacts.append(impact)
            
    return {
        "changed_functions": changes,
        "impact": impacts,
        "global_static_issues": static_issues
    }

def run_manual_impact_analysis(repo_id: str, file_path: str, function_name: str, code: str) -> dict:
    """Performs impact analysis for a specific function/code block provided manually by the user."""
    # 1. Analyze graph impact for the specific function
    impact = analyze_impact(function_name, repo_id)
    
    # 2. Get semantic context from Pinecone
    try:
        semantic_context = get_context(function_name, repo_id)
        impact["semantic_context"] = semantic_context
    except Exception:
        impact["semantic_context"] = []
        
    return {
        "changed_functions": {
            "modified": [function_name],
            "raw_diff": f"--- Manual Analysis ---\nFile: {file_path}\nFunction: {function_name}\n\n{code}"
        },
        "impact": [impact]
    }

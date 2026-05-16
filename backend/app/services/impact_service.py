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

def run_impact_analysis(repo_id: str) -> dict:
    changes = detect_change(repo_id)
    
    impacts = []
    # Analyze impact for all potentially changed functions
    changed_funcs = changes["added"] + changes["removed"] + changes["modified"]
    
    for func in changed_funcs:
        impact = analyze_impact(func, repo_id)
        
        # Get semantic context from Pinecone Vector DB
        try:
            semantic_context = get_context(func, repo_id)
            impact["semantic_context"] = semantic_context
        except Exception:
            impact["semantic_context"] = []
            
        # Add to output if we found graph files or semantic context
        if impact["affected_files"] or impact.get("semantic_context"):
            impacts.append(impact)
            
    return {
        "changed_functions": changes,
        "impact": impacts
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

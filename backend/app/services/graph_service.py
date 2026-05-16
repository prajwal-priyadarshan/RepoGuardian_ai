import os
from neo4j import GraphDatabase
from dotenv import load_dotenv
from app.services import parser_service

class GraphService:
    def build_graph(self, repo_id: str):
        # Dynamically load env on each request so we don't have to restart the server
        load_dotenv(override=True)
        neo4j_uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        neo4j_user = os.getenv("NEO4J_USER", "neo4j")
        neo4j_password = os.getenv("NEO4J_PASSWORD", "password")
        
        driver = GraphDatabase.driver(neo4j_uri, auth=(neo4j_user, neo4j_password))
        
        try:
            parsed_data = parser_service.parse_repository(repo_id)
            
            with driver.session() as session:
                # By passing all data to a single transaction function, 
                # we do 1 network roundtrip instead of 1000 roundtrips!
                session.execute_write(self._build_graph_tx, repo_id, parsed_data)
        finally:
            driver.close()

    @staticmethod
    def _build_graph_tx(tx, repo_id, parsed_data):
        for file_data in parsed_data:
            file_name = file_data.get("file")
            if not file_name:
                continue
                
            # Create File Node
            tx.run("MERGE (f:File {name: $file_name, repo_id: $repo_id})", file_name=file_name, repo_id=repo_id)
            
            # Create Function Nodes and relationships
            for func in file_data.get("functions", []):
                func_name = func.get("name")
                if func_name:
                    query = """
                    MATCH (f:File {name: $file_name, repo_id: $repo_id})
                    MERGE (func:Function {name: $func_name, repo_id: $repo_id})
                    MERGE (func)-[:DEFINED_IN]->(f)
                    """
                    tx.run(query, file_name=file_name, func_name=func_name, repo_id=repo_id)
                
            # Create Class Nodes and relationships
            for cls in file_data.get("classes", []):
                cls_name = cls.get("name")
                if cls_name:
                    query = """
                    MATCH (f:File {name: $file_name, repo_id: $repo_id})
                    MERGE (cls:Class {name: $cls_name, repo_id: $repo_id})
                    MERGE (cls)-[:DEFINED_IN]->(f)
                    """
                    tx.run(query, file_name=file_name, cls_name=cls_name, repo_id=repo_id)
                
            # Create Import relationships
            for imp in file_data.get("imports", []):
                if imp:
                    GraphService._merge_import(tx, repo_id, file_name, imp)

    @staticmethod
    def _merge_import(tx, repo_id, file_name, imported_module):
        query = """
        MATCH (f1:File {name: $file_name, repo_id: $repo_id})
        MERGE (f2:File {name: $imported_module, repo_id: $repo_id})
        MERGE (f1)-[:IMPORTS]->(f2)
        """
        tx.run(query, file_name=file_name, imported_module=imported_module, repo_id=repo_id)

    def clear_graph(self):
        """Utility to wipe the entire Neo4j database during development."""
        load_dotenv(override=True)
        neo4j_uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
        neo4j_user = os.getenv("NEO4J_USER", "neo4j")
        neo4j_password = os.getenv("NEO4J_PASSWORD", "password")
        
        driver = GraphDatabase.driver(neo4j_uri, auth=(neo4j_user, neo4j_password))
        try:
            with driver.session() as session:
                session.run("MATCH (n) DETACH DELETE n")
        finally:
            driver.close()

# Singleton instance
graph_service_instance = GraphService()

def build_graph(repo_id: str):
    graph_service_instance.build_graph(repo_id)

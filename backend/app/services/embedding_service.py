import os
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv

from langchain_google_genai import GoogleGenerativeAIEmbeddings

load_dotenv(override=True)

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
PINECONE_ENVIRONMENT = os.getenv("PINECONE_ENVIRONMENT", "us-east-1")
PINECONE_INDEX_NAME = os.getenv("PINECONE_INDEX_NAME", "repoguardian-gemini")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

embeddings_model = None
if GEMINI_API_KEY:
    embeddings_model = GoogleGenerativeAIEmbeddings(
        model="models/gemini-embedding-001",
        google_api_key=GEMINI_API_KEY
    )

def get_pinecone_client():
    if not PINECONE_API_KEY:
        raise ValueError("PINECONE_API_KEY is not set.")
    return Pinecone(api_key=PINECONE_API_KEY)

def initialize_index():
    pc = get_pinecone_client()
    existing_indexes = [index_info["name"] for index_info in pc.list_indexes()]
    
    if PINECONE_INDEX_NAME not in existing_indexes:
        pc.create_index(
            name=PINECONE_INDEX_NAME,
            dimension=3072, # Gemini-embedding-001 dimension
            metric='cosine',
            spec=ServerlessSpec(
                cloud='aws',
                region=PINECONE_ENVIRONMENT
            )
        )

def generate_embedding(text: str) -> list[float]:
    if not embeddings_model:
        raise ValueError("GEMINI_API_KEY is missing. Please add it to your .env file.")
    return embeddings_model.embed_query(text)

def store_embeddings(repo_id: str, parsed_data: list[dict]):
    pc = get_pinecone_client()
    index = pc.Index(PINECONE_INDEX_NAME)
    
    vectors = []
    
    for file_data in parsed_data:
        file_name = file_data.get("file", "")
        
        for func in file_data.get("functions", []):
            func_name = func.get("name") if isinstance(func, dict) else func
            if not func_name:
                continue
                
            text = f"Function '{func_name}' is defined in file '{file_name}'."
            embedding = generate_embedding(text)
            
            vector_id = f"{repo_id}::{file_name}::{func_name}".replace("/", "_")
            
            vectors.append({
                "id": vector_id,
                "values": embedding,
                "metadata": {
                    "repo_id": repo_id,
                    "file": file_name,
                    "function": func_name,
                    "type": "function",
                    "text": text
                }
            })
            
    if vectors:
        index.upsert(vectors=vectors)

def query_embeddings(query: str, repo_id: str) -> list[str]:
    pc = get_pinecone_client()
    index = pc.Index(PINECONE_INDEX_NAME)
    
    query_vector = generate_embedding(query)
    
    res = index.query(
        vector=query_vector,
        top_k=5,
        filter={"repo_id": repo_id},
        include_metadata=True
    )
    
    results = []
    for match in res.get("matches", []):
        metadata = match.get("metadata", {})
        results.append(metadata.get("text", ""))
        
    return results

import uuid
import os
import shutil
import zipfile
from pathlib import Path
from git import Repo
from app.services import git_service, graph_service, parser_service, embedding_service

BASE_REPOS_DIR = Path("data/repos")
BASE_REPOS_DIR.mkdir(parents=True, exist_ok=True)

def _post_clone_processing(repo_id: str):
    """Internal helper to automatically index the repo for graph and vector search."""
    try:
        # 1. Parse the repository to get functions/classes/imports
        parsed_data = parser_service.parse_repository(repo_id)
        
        # 2. Build the dependency graph in Neo4j
        graph_service.build_graph(repo_id)
        
        # 3. Store embeddings in Pinecone
        embedding_service.store_embeddings(repo_id, parsed_data)
    except Exception as e:
        print(f"Warning: Background processing failed for repo {repo_id}: {e}")

def clone_repo(repo_url: str) -> str:
    repo_id = str(uuid.uuid4())
    repo_path = BASE_REPOS_DIR / repo_id
    
    # Clone the repository
    Repo.clone_from(repo_url, str(repo_path))
    
    # Initialize snapshot so we can track future diffs
    git_service.initialize_repo(str(repo_path))
    
    # Auto-index the repository
    _post_clone_processing(repo_id)
    
    return repo_id

def extract_zip(file) -> str:
    repo_id = str(uuid.uuid4())
    repo_path = BASE_REPOS_DIR / repo_id
    repo_path.mkdir(parents=True, exist_ok=True)
    
    # Temporarily save the uploaded zip
    zip_path = repo_path / "temp.zip"
    with open(zip_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Extract
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(repo_path)
        
    # Remove the zip file
    os.remove(zip_path)
    
    # Initialize snapshot so we can track future diffs
    git_service.initialize_repo(str(repo_path))
    
    # Auto-index the repository
    _post_clone_processing(repo_id)
    
    return repo_id

def sync_repository(repo_id: str):
    """Pulls latest changes from GitHub and updates only the modified parts in RAG/Graph."""
    repo_path = BASE_REPOS_DIR / repo_id
    
    # 1. Pull latest changes (git_service.get_diff handles the pull internally)
    diff_text = git_service.get_diff(str(repo_path))
    
    if not diff_text:
        return # No changes to sync
        
    # 2. Re-run indexing. Our services use MERGE/upsert so this is safe and efficient.
    _post_clone_processing(repo_id)

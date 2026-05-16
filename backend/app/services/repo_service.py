import uuid
import os
import shutil
import zipfile
from pathlib import Path
from git import Repo
from app.services import git_service

BASE_REPOS_DIR = Path("data/repos")
BASE_REPOS_DIR.mkdir(parents=True, exist_ok=True)

def clone_repo(repo_url: str) -> str:
    repo_id = str(uuid.uuid4())
    repo_path = BASE_REPOS_DIR / repo_id
    
    # Clone the repository
    Repo.clone_from(repo_url, str(repo_path))
    
    # Initialize snapshot so we can track future diffs
    git_service.initialize_repo(str(repo_path))
    
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
    
    return repo_id

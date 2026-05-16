import os
from typing import List
from pathlib import Path

BASE_DATA_DIR = Path("data/repos")

IGNORE_DIRS = {
    "node_modules",
    ".git",
    "__pycache__",
    "build",
    "dist",
    "venv"
}

IGNORE_FILES = {
    ".DS_Store"
}

ALLOWED_EXTENSIONS = {
    ".py",
    ".js",
    ".ts",
    ".jsx",
    ".tsx",
    ".java",
    ".cpp",
    ".c"
}

def scan_repository(repo_id: str) -> List[str]:
    repo_path = BASE_DATA_DIR / repo_id
    
    if not repo_path.exists() or not repo_path.is_dir():
        raise FileNotFoundError(f"Repository {repo_id} not found.")
        
    scanned_files = []
    
    for root, dirs, files in os.walk(repo_path):
        # Modify dirs in-place to prevent os.walk from descending into ignored directories
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS]
        
        for file in files:
            if file in IGNORE_FILES:
                continue
                
            if file.endswith(".log") or file.endswith(".tmp"):
                continue
                
            _, ext = os.path.splitext(file)
            if ext in ALLOWED_EXTENSIONS:
                full_path = Path(root) / file
                # Calculate relative path from the repository root
                rel_path = full_path.relative_to(repo_path)
                # Use .as_posix() to ensure cross-platform compatibility (forward slashes)
                scanned_files.append(rel_path.as_posix())
                
    return scanned_files

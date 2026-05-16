import os
import re
from git import Repo

def initialize_repo(repo_path: str):
    repo = Repo.init(repo_path)
    
    # If the repo doesn't have any commits yet (like an uploaded zip)
    if not repo.head.is_valid():
        repo.git.add(A=True)
        repo.index.commit("initial snapshot")
    else:
        # If it was cloned but has untracked/dirty files
        if repo.is_dirty(untracked_files=True):
            repo.git.add(A=True)
            repo.index.commit("initial snapshot")

def get_diff(repo_path: str) -> str:
    repo = Repo(repo_path)
    return repo.git.diff()

def extract_changed_functions(diff_text: str) -> list[str]:
    changed_functions = set()
    lines = diff_text.split('\n')
    
    # Basic string/regex matching for Python function definitions
    for line in lines:
        if line.startswith('+def ') or line.startswith('-def '):
            # Extract function name: +def login(user): -> login
            match = re.match(r'^[+-]def\s+([a-zA-Z0-9_]+)\s*\(', line)
            if match:
                changed_functions.add(match.group(1))
                
    return list(changed_functions)

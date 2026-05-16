import os
import shutil
import subprocess
from pathlib import Path
from git import Repo

def create_backup(repo_id: str, file_path: str) -> str:
    base_path = Path("data/repos") / repo_id
    full_path = base_path / file_path
    
    # Create a safe .bak copy of the file before doing anything
    backup_path = full_path.with_suffix(full_path.suffix + ".bak")
    
    if full_path.exists():
        shutil.copy2(full_path, backup_path)
    return str(backup_path)

def apply_fix(repo_id: str, file_path: str, fixed_code: str):
    base_path = Path("data/repos") / repo_id
    full_path = base_path / file_path
    
    # Assuming the AI provides the complete fixed file content
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(fixed_code)

def validate_fix(repo_id: str, file_path: str) -> bool:
    base_path = Path("data/repos") / repo_id
    full_path = base_path / file_path
    
    # Only support Python syntax validation for now
    if not str(full_path).endswith(".py"):
        return True
        
    try:
        # Check for python syntax errors using py_compile
        result = subprocess.run(
            ["python", "-m", "py_compile", str(full_path)],
            capture_output=True,
            text=True
        )
        return result.returncode == 0
    except Exception:
        return False

def rollback_fix(repo_id: str, file_path: str, backup_path: str):
    base_path = Path("data/repos") / repo_id
    full_path = base_path / file_path
    
    # 1. Restore the file from our physical backup copy
    if os.path.exists(backup_path):
        shutil.move(backup_path, full_path)
        
    # 2. Reset the git state just in case
    repo = Repo(str(base_path))
    repo.git.checkout('--', str(full_path))

def run_self_healing(repo_id: str, file_path: str, fixed_code: str) -> dict:
    base_path = Path("data/repos") / repo_id
    full_path = base_path / file_path
    
    if not full_path.exists():
        return {
            "status": "failed",
            "message": "File not found.",
            "rollback": False
        }
    
    # 1. Create Backup
    backup_path = create_backup(repo_id, file_path)
    
    # 2. Apply AI Fix
    apply_fix(repo_id, file_path, fixed_code)
    
    # 3. Validate
    is_valid = validate_fix(repo_id, file_path)
    
    if is_valid:
        # 4a. Success: Commit changes
        repo = Repo(str(base_path))
        repo.git.add(str(file_path))
        repo.index.commit("Auto-fix applied by RepoGuardian AI")
        
        # Cleanup backup
        if os.path.exists(backup_path):
            os.remove(backup_path)
            
        return {
            "status": "applied",
            "message": "Validation passed. AI fix applied and committed.",
            "rollback": False
        }
    else:
        # 4b. Failure: Rollback changes instantly
        rollback_fix(repo_id, file_path, backup_path)
        
        return {
            "status": "failed",
            "message": "Syntax validation failed! AI fix introduced a bug. Rolled back successfully.",
            "rollback": True
        }

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

from app.services import static_analysis_service

def validate_fix(repo_id: str, file_path: str) -> bool:
    base_path = Path("data/repos") / repo_id
    full_path = base_path / file_path
    
    # 1. Basic Syntax Check
    if str(full_path).endswith(".py"):
        try:
            subprocess.run(["python", "-m", "py_compile", str(full_path)], capture_output=True, check=True)
        except Exception:
            return False
            
    # 2. Heuristic Static Analysis (Phase 9 Gap Fix)
    with open(full_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # We simulate a 'diff' for the static analyzer by comparing against the file content
    issues = static_analysis_service.analyze_changes("+ " + content.replace("\n", "\n+ "))
    
    # If the static analyzer finds hardcoded secrets or other critical issues, fail validation
    if any("secret" in issue.lower() or "password" in issue.lower() for issue in issues):
        return False
        
    return True

def propagate_fix_to_dependencies(repo_id: str, original_file: str, dependent_files: list[str]):
    """Iterates through all dependent files and updates them to maintain compatibility."""
    # This is Step 9.3: Multi-file Update
    # For now, we log the propagation. In a full implementation, we would loop through 
    # and call ai_service.generate_fix_code for each dependent file context.
    print(f"Propagating changes from {original_file} to {len(dependent_files)} dependencies: {dependent_files}")
    pass

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

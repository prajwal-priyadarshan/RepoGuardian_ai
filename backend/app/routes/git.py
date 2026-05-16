from fastapi import APIRouter, HTTPException
from pathlib import Path
from app.services import git_service

router = APIRouter()

@router.post("/diff/{repo_id}")
def get_git_diff(repo_id: str):
    repo_path = Path("data/repos") / repo_id
    if not repo_path.exists():
        raise HTTPException(status_code=404, detail="Repo not found")
        
    try:
        diff_text = git_service.get_diff(str(repo_path))
        changed_functions = git_service.extract_changed_functions(diff_text)
        
        return {
            "changed_functions": changed_functions,
            "raw_diff": diff_text
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

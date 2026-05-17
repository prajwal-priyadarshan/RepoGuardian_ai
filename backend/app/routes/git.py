from fastapi import APIRouter, HTTPException, Depends
from pathlib import Path
from app.services import git_service
from app.services.auth_service import get_current_user, verify_repo_ownership

router = APIRouter()

@router.post("/diff/{repo_id}")
def get_git_diff(repo_id: str, user_id: str = Depends(get_current_user)):
    try:
        # Enforce that the requesting user owns this repository
        verify_repo_ownership(repo_id, user_id)
        
        repo_path = Path("data/repos") / repo_id
        if not repo_path.exists():
            raise HTTPException(status_code=404, detail="Repo not found")
            
        diff_text = git_service.get_diff(str(repo_path))
        changed_functions = git_service.extract_changed_functions(diff_text)
        
        return {
            "changed_functions": changed_functions,
            "raw_diff": diff_text
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

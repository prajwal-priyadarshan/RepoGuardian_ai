from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException

from app.services import git_service

BASE_DIR = Path(__file__).resolve().parents[2]
REPOS_DIR = BASE_DIR / "data" / "repos"

from app.services.auth_service import get_current_user, verify_repo_ownership


router = APIRouter()


@router.post("/diff/{repo_id}")
def get_git_diff(repo_id: str, user_id: str = Depends(get_current_user)):
    try:
        verify_repo_ownership(repo_id, user_id)

        repo_path = REPOS_DIR / repo_id
        if not repo_path.exists():
            raise HTTPException(status_code=404, detail="Repo not found")

        diff_text = git_service.get_diff(str(repo_path))
        changed_functions = git_service.extract_changed_functions(diff_text)

        return {
            "changed_functions": changed_functions,
            "raw_diff": diff_text,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/count")
def get_github_repo_count(_: str = Depends(get_current_user)):
    if not REPOS_DIR.exists():
        return {"count": 0}

    repo_count = sum(1 for item in REPOS_DIR.iterdir() if item.is_dir())
    return {"count": repo_count}

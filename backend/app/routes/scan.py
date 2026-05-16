from fastapi import APIRouter, HTTPException
from app.services import file_scanner

router = APIRouter()

@router.get("/{repo_id}")
def scan_repo_endpoint(repo_id: str):
    if not repo_id or not repo_id.strip():
        raise HTTPException(status_code=400, detail="Invalid repo_id provided.")
        
    try:
        files = file_scanner.scan_repository(repo_id)
        return {
            "repo_id": repo_id,
            "files": files
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from pydantic import BaseModel
from app.services import repo_service
from app.services.auth_service import get_current_user, verify_repo_ownership, supabase

router = APIRouter()

class CloneRequest(BaseModel):
    repo_url: str

def extract_repo_name(url: str) -> str:
    """Helper to extract repository name from a git URL."""
    try:
        parts = url.rstrip("/").rstrip(".git").split("/")
        return parts[-1]
    except Exception:
        return "Unnamed Repository"

@router.post("/clone")
def clone_repo_endpoint(request: CloneRequest, user_id: str = Depends(get_current_user)):
    try:
        # 1. Clone physical codebase locally
        repo_id = repo_service.clone_repo(request.repo_url)
        
        # 2. Extract repository name
        repo_name = extract_repo_name(request.repo_url)
        
        # 3. Store the mapping user_id -> repo_id in Supabase PostgreSQL
        supabase.table("repositories").insert({
            "id": repo_id,
            "user_id": user_id,
            "name": repo_name,
            "repo_url": request.repo_url,
            "source": "github"
        }).execute()
        
        return {"repo_id": repo_id, "status": "cloned"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/upload")
def upload_repo_endpoint(file: UploadFile = File(...), user_id: str = Depends(get_current_user)):
    try:
        # 1. Extract uploaded zip file locally
        repo_id = repo_service.extract_zip(file)
        
        # 2. Extract repository name from filename
        repo_name = file.filename.rstrip(".zip") if file.filename else "Uploaded Repository"
        
        # 3. Store the mapping user_id -> repo_id in Supabase PostgreSQL
        supabase.table("repositories").insert({
            "id": repo_id,
            "user_id": user_id,
            "name": repo_name,
            "source": "upload"
        }).execute()
        
        return {"repo_id": repo_id, "status": "uploaded"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/sync/{repo_id}")
def sync_repo_endpoint(repo_id: str, user_id: str = Depends(get_current_user)):
    try:
        # Enforce that the requesting user owns this repository
        verify_repo_ownership(repo_id, user_id)
        
        repo_service.sync_repository(repo_id)
        return {"repo_id": repo_id, "status": "synced", "message": "Knowledge base updated with latest GitHub changes."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

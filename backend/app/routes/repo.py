from fastapi import APIRouter, HTTPException, UploadFile, File
from pydantic import BaseModel
from app.services import repo_service

router = APIRouter()

class CloneRequest(BaseModel):
    repo_url: str

@router.post("/clone")
def clone_repo_endpoint(request: CloneRequest):
    try:
        repo_id = repo_service.clone_repo(request.repo_url)
        return {"repo_id": repo_id, "status": "cloned"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/upload")
def upload_repo_endpoint(file: UploadFile = File(...)):
    try:
        repo_id = repo_service.extract_zip(file)
        return {"repo_id": repo_id, "status": "uploaded"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/sync/{repo_id}")
def sync_repo_endpoint(repo_id: str):
    try:
        repo_service.sync_repository(repo_id)
        return {"repo_id": repo_id, "status": "synced", "message": "Knowledge base updated with latest GitHub changes."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

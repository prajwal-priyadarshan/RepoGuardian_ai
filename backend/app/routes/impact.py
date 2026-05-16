from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services import impact_service

router = APIRouter()

class ImpactRequest(BaseModel):
    repo_id: str
    file_path: str
    new_code: str

@router.post("/analyze")
def analyze_impact_endpoint(req: ImpactRequest):
    if not req.repo_id or not req.file_path:
        raise HTTPException(status_code=400, detail="repo_id and file_path are required.")
        
    try:
        result = impact_service.run_impact_analysis(req.repo_id, req.file_path, req.new_code)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services import impact_service

router = APIRouter()

from typing import Optional

class ImpactRequest(BaseModel):
    repo_id: str

@router.post("/analyze")
def analyze_impact_endpoint(req: ImpactRequest):
    if not req.repo_id:
        raise HTTPException(status_code=400, detail="repo_id is required.")
        
    try:
        result = impact_service.run_impact_analysis(req.repo_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

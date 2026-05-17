from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.services import impact_service
from app.services.auth_service import get_current_user, verify_repo_ownership

router = APIRouter()

from typing import Optional

class ImpactRequest(BaseModel):
    repo_id: str

@router.post("/analyze")
def analyze_impact_endpoint(req: ImpactRequest, user_id: str = Depends(get_current_user)):
    if not req.repo_id:
        raise HTTPException(status_code=400, detail="repo_id is required.")
        
    try:
        # Enforce that the requesting user owns this repository
        verify_repo_ownership(req.repo_id, user_id)
        
        result = impact_service.run_impact_analysis(req.repo_id)
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

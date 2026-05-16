from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services import self_healing_service

router = APIRouter()

class SelfHealRequest(BaseModel):
    repo_id: str
    file_path: str
    fixed_code: str

@router.post("/")
def trigger_self_healing(req: SelfHealRequest):
    try:
        result = self_healing_service.run_self_healing(
            repo_id=req.repo_id, 
            file_path=req.file_path, 
            fixed_code=req.fixed_code
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

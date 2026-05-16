from fastapi import APIRouter, HTTPException
from app.services import parser_service

router = APIRouter()

@router.get("/{repo_id}")
def parse_repo_endpoint(repo_id: str):
    if not repo_id or not repo_id.strip():
        raise HTTPException(status_code=400, detail="Invalid repo_id provided.")
        
    try:
        parsed_data = parser_service.parse_repository(repo_id)
        return {
            "repo_id": repo_id,
            "parsed_data": parsed_data
        }
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")

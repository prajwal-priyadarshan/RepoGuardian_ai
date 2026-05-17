from fastapi import APIRouter, HTTPException, Depends
from app.services import parser_service
from app.services.auth_service import get_current_user, verify_repo_ownership

router = APIRouter()

@router.get("/{repo_id}")
def parse_repo_endpoint(repo_id: str, user_id: str = Depends(get_current_user)):
    if not repo_id or not repo_id.strip():
        raise HTTPException(status_code=400, detail="Invalid repo_id provided.")
        
    try:
        # Enforce that the requesting user owns this repository
        verify_repo_ownership(repo_id, user_id)
        
        parsed_data = parser_service.parse_repository(repo_id)
        return {
            "repo_id": repo_id,
            "parsed_data": parsed_data
        }
    except HTTPException:
        raise
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

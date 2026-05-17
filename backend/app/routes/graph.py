from fastapi import APIRouter, HTTPException, Depends
from app.services import graph_service
from app.services.auth_service import get_current_user, verify_repo_ownership

router = APIRouter()

@router.post("/build/{repo_id}")
def build_graph_endpoint(repo_id: str, user_id: str = Depends(get_current_user)):
    if not repo_id or not repo_id.strip():
        raise HTTPException(status_code=400, detail="Invalid repo_id provided.")
        
    try:
        # Enforce that the requesting user owns this repository
        verify_repo_ownership(repo_id, user_id)
        
        graph_service.build_graph(repo_id)
        return {
            "repo_id": repo_id,
            "status": "graph_built"
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/clear")
def clear_graph_endpoint(user_id: str = Depends(get_current_user)):
    try:
        graph_service.graph_service_instance.clear_graph()
        return {"status": "success", "message": "Database wiped successfully!"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

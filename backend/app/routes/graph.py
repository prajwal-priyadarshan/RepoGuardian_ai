from fastapi import APIRouter, HTTPException
from app.services import graph_service

router = APIRouter()

@router.post("/build/{repo_id}")
def build_graph_endpoint(repo_id: str):
    if not repo_id or not repo_id.strip():
        raise HTTPException(status_code=400, detail="Invalid repo_id provided.")
        
    try:
        graph_service.build_graph(repo_id)
        return {
            "repo_id": repo_id,
            "status": "graph_built"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/clear")
def clear_graph_endpoint():
    try:
        graph_service.graph_service_instance.clear_graph()
        return {"status": "success", "message": "Database wiped successfully!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

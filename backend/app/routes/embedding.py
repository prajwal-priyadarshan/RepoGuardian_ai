from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.services import embedding_service
from app.services import parser_service
from app.services.auth_service import get_current_user, verify_repo_ownership

router = APIRouter()

class QueryRequest(BaseModel):
    query: str
    repo_id: str

@router.post("/store/{repo_id}")
def store_repo_embeddings(repo_id: str, user_id: str = Depends(get_current_user)):
    try:
        # Enforce that the requesting user owns this repository
        verify_repo_ownership(repo_id, user_id)
        
        # Initialize Pinecone index lazily
        embedding_service.initialize_index()
        
        # Get parsed data for the repository
        parsed_data = parser_service.parse_repository(repo_id)
        
        # Generate and store embeddings
        embedding_service.store_embeddings(repo_id, parsed_data)
        
        return {"status": "success", "message": f"Embeddings stored successfully for repo {repo_id}"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/query")
def query_repo_embeddings(req: QueryRequest, user_id: str = Depends(get_current_user)):
    try:
        # Enforce that the requesting user owns this repository
        verify_repo_ownership(req.repo_id, user_id)
        
        results = embedding_service.query_embeddings(req.query, req.repo_id)
        return {"results": results}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services import embedding_service
from app.services import parser_service

router = APIRouter()

class QueryRequest(BaseModel):
    query: str
    repo_id: str

@router.post("/store/{repo_id}")
def store_repo_embeddings(repo_id: str):
    try:
        # Initialize Pinecone index lazily
        embedding_service.initialize_index()
        
        # Get parsed data for the repository
        parsed_data = parser_service.parse_repository(repo_id)
        
        # Generate and store embeddings
        embedding_service.store_embeddings(repo_id, parsed_data)
        
        return {"status": "success", "message": f"Embeddings stored successfully for repo {repo_id}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/query")
def query_repo_embeddings(req: QueryRequest):
    try:
        results = embedding_service.query_embeddings(req.query, req.repo_id)
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

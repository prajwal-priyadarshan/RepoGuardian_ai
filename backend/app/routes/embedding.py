from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.services import embedding_service
from app.services import parser_service
from app.services.auth_service import get_current_user, verify_repo_ownership
from pathlib import Path
import os

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


@router.post("/query/dev")
def query_repo_embeddings_dev(req: QueryRequest):
    from app.utils.dev_mode import dev_endpoints_enabled

    if not dev_endpoints_enabled():
        raise HTTPException(status_code=403, detail="Dev query only available in DEBUG mode")

    try:
        repo_root = Path("data/repos") / req.repo_id
        if not repo_root.exists():
            raise HTTPException(status_code=404, detail="Repository not found")

        terms = [t.lower() for t in req.query.split() if t.strip()]
        if not terms:
            return {"results": []}

        results = []
        for file_path in repo_root.rglob("*"):
            if not file_path.is_file():
                continue
            try:
                text = file_path.read_text(encoding="utf-8", errors="ignore")
            except Exception:
                continue

            lowered = text.lower()
            score_hits = sum(lowered.count(term) for term in terms)
            if score_hits <= 0:
                continue

            first_term = terms[0]
            idx = lowered.find(first_term)
            if idx < 0:
                idx = 0
            start = max(0, idx - 140)
            end = min(len(text), idx + 260)

            rel_path = file_path.relative_to(repo_root).as_posix()
            results.append({
                "id": f"{req.repo_id}:{rel_path}:{idx}",
                "score": min(1.0, 0.2 + (0.15 * score_hits)),
                "metadata": {
                    "file_path": rel_path,
                    "function_name": "context",
                    "code": text[start:end],
                    "line_start": 1,
                    "line_end": text.count("\n", 0, end) + 1,
                },
            })

        results = sorted(results, key=lambda r: r["score"], reverse=True)[:25]
        return {"results": results}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

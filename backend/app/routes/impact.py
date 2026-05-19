from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.services import impact_service
from app.services import parser_service
from app.services.auth_service import get_current_user, verify_repo_ownership
import os

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


@router.post("/analyze/dev")
def analyze_impact_endpoint_dev(req: ImpactRequest):
    from app.utils.dev_mode import dev_endpoints_enabled

    if not dev_endpoints_enabled():
        raise HTTPException(status_code=403, detail="Dev impact only available in DEBUG mode")

    if not req.repo_id:
        raise HTTPException(status_code=400, detail="repo_id is required.")

    try:
        result = impact_service.run_impact_analysis(req.repo_id)
        if result.get("impact"):
            return result
    except Exception:
        pass

    # Fallback if full impact pipeline is unavailable or returns empty in local demo mode.
    parsed = parser_service.parse_repository(req.repo_id)
    impact = []

    for file_data in parsed[:10]:
        file_name = file_data.get("file")
        for fn in file_data.get("functions", [])[:5]:
            fn_name = fn.get("name") if isinstance(fn, dict) else str(fn)
            calls = fn.get("calls", []) if isinstance(fn, dict) else []
            risk_score = min(10.0, round(1.5 + (0.6 * len(calls)), 2))
            impact.append({
                "function": fn_name,
                "affected_files": [file_name],
                "semantic_context": [f"{file_name}::{fn_name}", f"calls={', '.join(calls[:5])}"],
                "risk_score": risk_score,
            })

    if not impact:
        impact.append({
            "function": "repository_init",
            "affected_files": ["README.md"],
            "semantic_context": ["Synthetic impact entry for demo mode"],
            "risk_score": 3.5,
        })

    aggregate_risk = round(sum(i.get("risk_score", 0) for i in impact) / max(1, len(impact)), 2)
    return {
        "repo_id": req.repo_id,
        "changed_functions": {
            "raw_diff": "dev-mode synthetic diff",
            "functions": [i["function"] for i in impact[:20]],
        },
        "impact": impact,
        "risk_score": aggregate_risk,
    }

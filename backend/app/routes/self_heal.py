from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.services import self_healing_service, impact_service, ai_service
from app.services.auth_service import get_current_user, verify_repo_ownership
import os

router = APIRouter()

class SelfHealRequest(BaseModel):
    repo_id: str

@router.post("/")
def trigger_self_healing(req: SelfHealRequest, user_id: str = Depends(get_current_user)):
    """Autonomous Self-Healing: Detects changes, generates fixes, and applies them automatically."""
    try:
        # Enforce that the requesting user owns this repository
        verify_repo_ownership(req.repo_id, user_id)
        
        # 1. Detect what changed and get context
        impact_res = impact_service.run_impact_analysis(repo_id=req.repo_id)
        
        if not impact_res.get("impact"):
            return {"status": "skipped", "message": "No functional changes detected to heal."}
            
        results = []
        
        # 2. Iterate through every changed entity
        for impact in impact_res.get("impact", []):
            entity_name = impact.get("function")
            
            # Find the primary file where this entity is defined
            # (We take the first affected file as the definition file for now)
            file_path = impact.get("affected_files", [None])[0]
            if not file_path:
                continue

            # 3. Generate the Fix Code using AI
            ai_data = {
                "function": entity_name,
                "changed_code": impact_res.get("changed_functions", {}).get("raw_diff", ""),
                "dependencies": impact.get("affected_files", []),
                "context": impact.get("semantic_context", [])
            }
            fixed_code = ai_service.generate_fix_code(ai_data)
            
            # 4. Apply and Validate the Fix
            heal_res = self_healing_service.run_self_healing(
                repo_id=req.repo_id,
                file_path=file_path,
                fixed_code=fixed_code
            )
            
            results.append({
                "entity": entity_name,
                "file": file_path,
                "result": heal_res
            })
            
        return {
            "repo_id": req.repo_id,
            "summary": results
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/dev")
def trigger_self_healing_dev(req: SelfHealRequest):
    from app.utils.dev_mode import dev_endpoints_enabled

    if not dev_endpoints_enabled():
        raise HTTPException(status_code=403, detail="Dev self-heal only available in DEBUG mode")

    if not req.repo_id:
        raise HTTPException(status_code=400, detail="repo_id is required")

    try:
        impact_res = impact_service.run_impact_analysis(repo_id=req.repo_id)
        impact_items = impact_res.get("impact", [])[:10]
    except Exception:
        impact_items = []

    summary = []
    for item in impact_items:
        fn_name = item.get("function", "unknown")
        file_path = (item.get("affected_files") or ["unknown"])[0]
        summary.append({
            "entity": fn_name,
            "file": file_path,
            "result": {
                "status": "patched",
                "message": f"Generated safe refactor patch for {fn_name}",
                "commit_sha": "dev-simulated",
                "validation": {
                    "syntax_valid": True,
                    "errors": [],
                },
            },
        })

    if not summary:
        summary.append({
            "entity": "repository",
            "file": "N/A",
            "result": {
                "status": "skipped",
                "message": "No high-risk entities detected in dev mode.",
                "commit_sha": "dev-simulated",
                "validation": {
                    "syntax_valid": True,
                    "errors": [],
                },
            },
        })

    return {
        "repo_id": req.repo_id,
        "message": "Dev self-healing simulation completed.",
        "summary": summary,
    }

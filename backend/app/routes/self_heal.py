from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services import self_healing_service

router = APIRouter()

from app.services import self_healing_service, impact_service, ai_service

class SelfHealRequest(BaseModel):
    repo_id: str

@router.post("/")
def trigger_self_healing(req: SelfHealRequest):
    """Autonomous Self-Healing: Detects changes, generates fixes, and applies them automatically."""
    try:
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

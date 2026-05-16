from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services import impact_service
from app.services import ai_service

router = APIRouter()

class AIAnalyzeRequest(BaseModel):
    repo_id: str
    file_path: str
    function: str
    changed_code: str

@router.post("/analyze")
def analyze_code_with_ai(req: AIAnalyzeRequest):
    try:
        # Step 1: Run standard impact analysis to get graph dependencies and vector context
        impact_res = impact_service.run_impact_analysis(
            repo_id=req.repo_id, 
            file_path=req.file_path, 
            new_code=req.changed_code
        )
        
        # Step 2: Find the specific function impact data
        func_impact = None
        for imp in impact_res.get("impact", []):
            if imp.get("function") == req.function:
                func_impact = imp
                break
                
        dependencies = func_impact.get("affected_files", []) if func_impact else []
        context = func_impact.get("semantic_context", []) if func_impact else []
        
        # Step 3: Prepare data for the AI Reasoning Engine
        ai_data = {
            "function": req.function,
            "changed_code": req.changed_code,
            "dependencies": dependencies,
            "context": context,
            "issues": []  # Placeholder for static analyzer issues
        }
        
        # Step 4: Run AI Analysis
        ai_result = ai_service.analyze_code_change(ai_data)
        
        return ai_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

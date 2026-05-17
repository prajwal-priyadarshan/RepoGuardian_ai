from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.services import impact_service
from app.services import ai_service
from app.services.auth_service import get_current_user, verify_repo_ownership

router = APIRouter()

class AIAnalyzeRequest(BaseModel):
    repo_id: str

@router.post("/analyze")
def analyze_code_with_ai(req: AIAnalyzeRequest, user_id: str = Depends(get_current_user)):
    try:
        # Enforce that the requesting user owns this repository
        verify_repo_ownership(req.repo_id, user_id)
        
        # Step 1: Run standard impact analysis 
        # (This now auto-syncs with GitHub and detects changes automatically!)
        impact_res = impact_service.run_impact_analysis(repo_id=req.repo_id)
        
        # Get the actual git diff text for the AI to read
        raw_diff = impact_res.get("changed_functions", {}).get("raw_diff", "")
        
        if not impact_res.get("impact"):
            return {
                "repo_id": req.repo_id,
                "message": "No functional changes detected in the latest commit.",
                "analyses": []
            }

        all_analyses = []
        
        # Step 2: Iterate through every impacted function/class and run AI Reasoning
        for func_impact in impact_res.get("impact", []):
            func_name = func_impact.get("function")
            dependencies = func_impact.get("affected_files", [])
            context = func_impact.get("semantic_context", [])
            
            # Prepare data for Groq Llama-3.3 Reasoning Engine
            ai_data = {
                "function": func_name,
                "changed_code": raw_diff,
                "dependencies": dependencies,
                "context": context,
                "issues": []
            }
            
            # Step 3: Run AI Analysis
            analysis_result = ai_service.analyze_code_change(ai_data)
            all_analyses.append(analysis_result)
        
        return {
            "repo_id": req.repo_id,
            "analyses": all_analyses
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class AIManualAnalyzeRequest(BaseModel):
    repo_id: str
    file_path: str
    function: str
    new_code: str

@router.post("/analyze/manual")
def analyze_code_manually(req: AIManualAnalyzeRequest, user_id: str = Depends(get_current_user)):
    """Manually analyzes a specific code change provided by the user, still using Graph and Vector context."""
    try:
        # Enforce that the requesting user owns this repository
        verify_repo_ownership(req.repo_id, user_id)
        
        # Step 1: Run manual impact analysis for the specific provided function
        impact_res = impact_service.run_manual_impact_analysis(
            repo_id=req.repo_id,
            file_path=req.file_path,
            function_name=req.function,
            code=req.new_code
        )
        
        # Step 2: Prepare data for AI Reasoning Engine
        func_impact = impact_res["impact"][0]
        ai_data = {
            "function": req.function,
            "changed_code": req.new_code,
            "dependencies": func_impact.get("affected_files", []),
            "context": func_impact.get("semantic_context", []),
            "issues": []
        }
        
        # Step 3: Run AI Analysis
        analysis_result = ai_service.analyze_code_change(ai_data)
        
        return {
            "repo_id": req.repo_id,
            "analysis": analysis_result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.services import pr_service, impact_service, ai_service

router = APIRouter()

class PRGenerateRequest(BaseModel):
    repo_id: str
    github_token: Optional[str] = None

class PRPatchRequest(BaseModel):
    repo_id: str

class PRRiskRequest(BaseModel):
    repo_id: str

@router.post("/generate")
def generate_pr_endpoint(req: PRGenerateRequest):
    """
    Phase 10: Complete PR Generation Pipeline
    1. Creates git patch
    2. Runs impact analysis
    3. Runs AI analysis
    4. Generates PR summary
    5. Creates GitHub PR (if token provided)
    """
    try:
        # Step 1: Create git patch
        patch_data = pr_service.create_git_patch(req.repo_id)
        
        if not patch_data.get("patch_content"):
            return {
                "status": "no_changes",
                "message": "No changes detected to create PR"
            }
        
        # Step 2: Run impact analysis
        impact_data = impact_service.run_impact_analysis(req.repo_id)
        
        # Step 3: Run AI analysis
        ai_analysis = {}
        if impact_data.get("impact"):
            try:
                ai_analysis = ai_service.analyze_code_change({
                    "function": impact_data["impact"][0].get("function", ""),
                    "changed_code": impact_data.get("changed_functions", {}).get("raw_diff", ""),
                    "dependencies": impact_data["impact"][0].get("affected_files", []),
                    "context": impact_data["impact"][0].get("semantic_context", []),
                    "issues": impact_data.get("global_static_issues", [])
                })
            except Exception as e:
                print(f"AI analysis failed: {e}")
        
        # Step 4: Generate PR summary
        pr_summary = pr_service.generate_pr_summary(req.repo_id, impact_data, {"analyses": [ai_analysis]} if ai_analysis else {})
        
        # Step 5: Create GitHub PR
        pr_result = pr_service.create_github_pr(req.repo_id, pr_summary, req.github_token)
        
        return {
            "repo_id": req.repo_id,
            "patch": {
                "type": patch_data.get("type"),
                "file": patch_data.get("patch_file")
            },
            "summary": pr_summary,
            "pr_result": pr_result
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/patch")
def create_patch_endpoint(req: PRPatchRequest):
    """Step 10.1: Create git patch only."""
    try:
        patch_data = pr_service.create_git_patch(req.repo_id)
        return {
            "repo_id": req.repo_id,
            "patch": patch_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/summary")
def generate_summary_endpoint(req: PRGenerateRequest):
    """Step 10.2: Generate PR summary with impact and AI analysis."""
    try:
        # Run impact analysis
        impact_data = impact_service.run_impact_analysis(req.repo_id)
        
        # Run AI analysis
        ai_analysis = {}
        if impact_data.get("impact"):
            try:
                analyses = []
                for imp in impact_data.get("impact", [])[:3]:  # Top 3
                    analysis = ai_service.analyze_code_change({
                        "function": imp.get("function", ""),
                        "changed_code": impact_data.get("changed_functions", {}).get("raw_diff", ""),
                        "dependencies": imp.get("affected_files", []),
                        "context": imp.get("semantic_context", []),
                        "issues": impact_data.get("global_static_issues", [])
                    })
                    analyses.append(analysis)
                ai_analysis = {"analyses": analyses}
            except Exception as e:
                print(f"AI analysis failed: {e}")
        
        # Generate summary
        pr_summary = pr_service.generate_pr_summary(req.repo_id, impact_data, ai_analysis)
        
        return {
            "repo_id": req.repo_id,
            "summary": pr_summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/risk-analysis")
def analyze_pr_risk_endpoint(req: PRRiskRequest):
    """Phase 12: Advanced PR Risk Analysis."""
    try:
        # Get impact data
        impact_data = impact_service.run_impact_analysis(req.repo_id)
        
        # Generate PR summary for risk analysis
        pr_summary = pr_service.generate_pr_summary(req.repo_id, impact_data, {})
        
        # Analyze risk
        risk_analysis = pr_service.analyze_pr_risk(req.repo_id, pr_summary)
        
        return {
            "repo_id": req.repo_id,
            "risk_analysis": risk_analysis,
            "pr_summary": pr_summary
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Made with Bob

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.services import impact_service
from app.services import ai_service
from app.services.auth_service import get_current_user, verify_repo_ownership
from app.services import parser_service
import os
from pathlib import Path
import re

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


@router.post("/analyze/dev")
def analyze_code_with_ai_dev(req: AIAnalyzeRequest):
    """Development-only analysis: parse repository and return simulated RAG analyses.

    This bypasses auth and external embedding/LLM services so it can be used
    to validate the parsing -> analysis pipeline locally.
    """
    from app.utils.dev_mode import dev_endpoints_enabled

    if not dev_endpoints_enabled():
        raise HTTPException(status_code=403, detail="Dev analyze only available in DEBUG mode")

    try:
        parsed = parser_service.parse_repository(req.repo_id)

        # Load repository files into memory for simple semantic search
        repo_base = Path("data/repos") / req.repo_id
        file_texts = {}
        for p in repo_base.rglob("*"):
            if p.is_file():
                try:
                    text = p.read_text(encoding="utf-8")
                    file_texts[p.relative_to(repo_base).as_posix()] = text
                except Exception:
                    continue

        analyses = []

        def extract_snippets(fn_name, files_dict, max_snippets=3):
            snippets = []
            pattern = re.compile(r"\b" + re.escape(fn_name) + r"\b")
            for fname, text in files_dict.items():
                for m in pattern.finditer(text):
                    start = max(0, m.start() - 200)
                    end = min(len(text), m.end() + 200)
                    snippet = text[start:end].strip()
                    snippets.append(f"{fname}: ...{snippet}...")
                    if len(snippets) >= max_snippets:
                        return snippets
            return snippets

        def heuristic_risk_score(snippet_list):
            score = 0.0
            for s in snippet_list:
                if re.search(r"\beval\(|\bexec\(|subprocess\.|os\.system\(|system\(|socket\.", s):
                    score += 40
                if "TODO" in s or "FIXME" in s:
                    score += 20
                # longer snippets increase the score mildly
                score += min(20, len(s) / 200)
            return min(100, int(score))

        for file_data in parsed:
            file_name = file_data.get("file")
            for func in file_data.get("functions", []):
                func_name = func.get("name") if isinstance(func, dict) else func
                if not func_name:
                    continue

                # semantic context: snippets where the function or its calls appear
                snippets = extract_snippets(func_name, file_texts, max_snippets=5)

                # also look for calls inside parsed calls
                calls = []
                if isinstance(func, dict):
                    calls = func.get("calls", [])
                for call in calls:
                    snippets += extract_snippets(call, file_texts, max_snippets=2)

                # dedupe snippets and limit
                seen = set()
                dedup_snips = []
                for s in snippets:
                    if s not in seen:
                        dedup_snips.append(s)
                        seen.add(s)
                    if len(dedup_snips) >= 5:
                        break

                risk = heuristic_risk_score(dedup_snips)

                analyses.append({
                    "function": func_name,
                    "explanation": f"Dev RAG-style analysis for {func_name} in {file_name}",
                    "risks": [],
                    "why_breaks": "",
                    "suggestions": [],
                    "fixed_code": "",
                    "semantic_context": dedup_snips,
                    "risk_score": risk
                })

        if not analyses:
            first_file = next(iter(file_texts.keys()), "repository")
            synthetic_context = []
            if first_file in file_texts:
                text = file_texts[first_file]
                synthetic_context.append(f"{first_file}: ...{text[:240]}...")
            analyses.append({
                "function": "repository_overview",
                "explanation": "Dev analysis synthesized from repository content when parser emitted no functions.",
                "risks": ["Low structural observability due to missing parsed symbols"],
                "why_breaks": "Parser produced limited symbols, so this summary is heuristic.",
                "suggestions": ["Add language parser support", "Run full graph indexing for richer context"],
                "fixed_code": "",
                "semantic_context": synthetic_context or ["No readable file context found"],
                "risk_score": 35,
            })

        return {
            "repo_id": req.repo_id,
            "message": "Simulated dev RAG analysis",
            "analyses": analyses
        }
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

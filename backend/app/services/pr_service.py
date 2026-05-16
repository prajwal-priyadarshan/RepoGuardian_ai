import os
import json
from pathlib import Path
from git import Repo
from datetime import datetime
from typing import Optional
import requests
from dotenv import load_dotenv

load_dotenv(override=True)

def create_git_patch(repo_id: str) -> dict:
    """Step 10.1: Create Git Patch from uncommitted or recent changes."""
    base_path = Path("data/repos") / repo_id
    repo = Repo(str(base_path))
    
    # Check if there are uncommitted changes
    if repo.is_dirty(untracked_files=True):
        # Get diff of uncommitted changes
        diff_text = repo.git.diff()
        patch_file = base_path / "latest.patch"
        
        with open(patch_file, "w", encoding="utf-8") as f:
            f.write(diff_text)
            
        return {
            "patch_file": str(patch_file),
            "patch_content": diff_text,
            "type": "uncommitted"
        }
    else:
        # Get diff of the most recent commit
        try:
            diff_text = repo.git.diff("HEAD~1", "HEAD")
            patch_file = base_path / "latest.patch"
            
            with open(patch_file, "w", encoding="utf-8") as f:
                f.write(diff_text)
                
            return {
                "patch_file": str(patch_file),
                "patch_content": diff_text,
                "type": "last_commit"
            }
        except Exception as e:
            return {
                "patch_file": None,
                "patch_content": "",
                "type": "none",
                "error": str(e)
            }

def generate_pr_summary(repo_id: str, impact_data: dict, ai_analysis: dict) -> dict:
    """Step 10.2: Generate PR Summary with risk score and explanation."""
    
    # Extract key information
    changed_functions = impact_data.get("changed_functions", {})
    impacts = impact_data.get("impact", [])
    
    # Calculate overall risk score
    total_risk = sum(imp.get("risk_score", 0) for imp in impacts)
    avg_risk = total_risk / len(impacts) if impacts else 0
    
    # Determine risk level
    if avg_risk < 5:
        risk_level = "LOW"
    elif avg_risk < 15:
        risk_level = "MEDIUM"
    else:
        risk_level = "HIGH"
    
    # Build affected files list
    affected_files = set()
    for imp in impacts:
        affected_files.update(imp.get("affected_files", []))
    
    # Build summary
    summary = {
        "title": f"[RepoGuardian AI] Automated Analysis - {risk_level} Risk",
        "risk_level": risk_level,
        "risk_score": round(avg_risk, 2),
        "timestamp": datetime.utcnow().isoformat(),
        "changed_entities": len(changed_functions.get("modified", [])) + 
                           len(changed_functions.get("added", [])) + 
                           len(changed_functions.get("removed", [])),
        "affected_files": list(affected_files),
        "affected_count": len(affected_files),
        "description": _build_pr_description(impacts, ai_analysis, risk_level),
        "recommendations": _extract_recommendations(ai_analysis)
    }
    
    return summary

def _build_pr_description(impacts: list, ai_analysis: dict, risk_level: str) -> str:
    """Build a detailed PR description."""
    description = f"## 🤖 RepoGuardian AI Analysis\n\n"
    description += f"**Risk Level:** {risk_level}\n\n"
    
    description += "### 📊 Impact Summary\n\n"
    for imp in impacts[:5]:  # Show top 5
        func_name = imp.get("function", "Unknown")
        affected = len(imp.get("affected_files", []))
        risk = imp.get("risk_score", 0)
        description += f"- **{func_name}**: {affected} files affected (Risk: {risk:.1f})\n"
    
    if len(impacts) > 5:
        description += f"\n_...and {len(impacts) - 5} more entities_\n"
    
    # Add AI insights if available
    if ai_analysis and ai_analysis.get("analyses"):
        description += "\n### 🧠 AI Insights\n\n"
        for analysis in ai_analysis.get("analyses", [])[:3]:
            description += f"**Explanation:** {analysis.get('explanation', 'N/A')}\n\n"
            
            risks = analysis.get('risks', [])
            if risks:
                description += "**Potential Risks:**\n"
                for risk in risks[:3]:
                    description += f"- {risk}\n"
                description += "\n"
    
    return description

def _extract_recommendations(ai_analysis: dict) -> list:
    """Extract recommendations from AI analysis."""
    recommendations = []
    
    if ai_analysis and ai_analysis.get("analyses"):
        for analysis in ai_analysis.get("analyses", []):
            suggestions = analysis.get("suggestions", [])
            recommendations.extend(suggestions[:2])  # Top 2 per analysis
    
    return recommendations[:5]  # Return top 5 overall

def create_github_pr(repo_id: str, pr_summary: dict, github_token: Optional[str] = None) -> dict:
    """Step 10.3: Push to GitHub and create PR."""
    base_path = Path("data/repos") / repo_id
    repo = Repo(str(base_path))
    
    # Check if repo has a remote
    if not repo.remotes:
        return {
            "status": "skipped",
            "message": "No GitHub remote configured. This is a local-only repository."
        }
    
    try:
        origin = repo.remotes.origin
        origin_url = list(origin.urls)[0]
        
        # Extract owner and repo name from URL
        # Format: https://github.com/owner/repo.git or git@github.com:owner/repo.git
        if "github.com" in origin_url:
            if origin_url.startswith("git@"):
                parts = origin_url.split(":")[-1].replace(".git", "").split("/")
            else:
                parts = origin_url.split("github.com/")[-1].replace(".git", "").split("/")
            
            if len(parts) >= 2:
                owner = parts[0]
                repo_name = parts[1]
            else:
                return {
                    "status": "error",
                    "message": "Could not parse GitHub repository URL"
                }
        else:
            return {
                "status": "skipped",
                "message": "Remote is not a GitHub repository"
            }
        
        # Create a new branch for the PR
        branch_name = f"repoguardian-ai-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        
        # Check if there are changes to commit
        if repo.is_dirty(untracked_files=True):
            # Create new branch
            new_branch = repo.create_head(branch_name)
            new_branch.checkout()
            
            # Stage and commit all changes
            repo.git.add(A=True)
            repo.index.commit(f"RepoGuardian AI: Automated fixes and improvements\n\n{pr_summary.get('description', '')}")
            
            # Push to remote (if token is provided)
            if github_token:
                # Set up authentication
                push_url = f"https://{github_token}@github.com/{owner}/{repo_name}.git"
                origin.set_url(push_url)
            
            try:
                origin.push(branch_name)
                
                # Create PR using GitHub API if token is provided
                if github_token:
                    pr_result = _create_github_pr_api(
                        owner, repo_name, branch_name, 
                        pr_summary, github_token
                    )
                    return pr_result
                else:
                    return {
                        "status": "branch_created",
                        "message": f"Branch '{branch_name}' created and pushed. Create PR manually on GitHub.",
                        "branch": branch_name,
                        "url": f"https://github.com/{owner}/{repo_name}/compare/{branch_name}"
                    }
            except Exception as e:
                return {
                    "status": "error",
                    "message": f"Failed to push branch: {str(e)}"
                }
        else:
            return {
                "status": "skipped",
                "message": "No changes to create PR"
            }
            
    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to create PR: {str(e)}"
        }

def _create_github_pr_api(owner: str, repo_name: str, branch: str, 
                          pr_summary: dict, token: str) -> dict:
    """Create PR using GitHub API."""
    url = f"https://api.github.com/repos/{owner}/{repo_name}/pulls"
    
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json"
    }
    
    data = {
        "title": pr_summary.get("title", "RepoGuardian AI: Automated Analysis"),
        "body": pr_summary.get("description", ""),
        "head": branch,
        "base": "main"  # or "master", could be made configurable
    }
    
    try:
        response = requests.post(url, headers=headers, json=data)
        
        if response.status_code == 201:
            pr_data = response.json()
            return {
                "status": "success",
                "message": "Pull request created successfully",
                "pr_number": pr_data.get("number"),
                "pr_url": pr_data.get("html_url"),
                "branch": branch
            }
        else:
            return {
                "status": "error",
                "message": f"GitHub API error: {response.status_code} - {response.text}"
            }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Failed to create PR via API: {str(e)}"
        }

def analyze_pr_risk(repo_id: str, pr_data: dict) -> dict:
    """Phase 12: Advanced PR Risk Analysis."""
    
    risk_factors = []
    risk_score = 0
    
    # Factor 1: Number of affected files
    affected_count = pr_data.get("affected_count", 0)
    if affected_count > 10:
        risk_factors.append("High number of affected files (>10)")
        risk_score += 3
    elif affected_count > 5:
        risk_factors.append("Moderate number of affected files (5-10)")
        risk_score += 2
    
    # Factor 2: Risk level from impact analysis
    risk_level = pr_data.get("risk_level", "LOW")
    if risk_level == "HIGH":
        risk_factors.append("High impact risk detected")
        risk_score += 5
    elif risk_level == "MEDIUM":
        risk_factors.append("Medium impact risk detected")
        risk_score += 3
    
    # Factor 3: Number of changed entities
    changed_count = pr_data.get("changed_entities", 0)
    if changed_count > 20:
        risk_factors.append("Large number of changed entities (>20)")
        risk_score += 3
    elif changed_count > 10:
        risk_factors.append("Moderate number of changed entities (10-20)")
        risk_score += 2
    
    # Determine overall assessment
    if risk_score >= 8:
        assessment = "HIGH_RISK"
        recommendation = "Requires thorough manual review before merging"
    elif risk_score >= 5:
        assessment = "MEDIUM_RISK"
        recommendation = "Review recommended, proceed with caution"
    else:
        assessment = "LOW_RISK"
        recommendation = "Safe to merge with standard review"
    
    return {
        "risk_score": risk_score,
        "assessment": assessment,
        "risk_factors": risk_factors,
        "recommendation": recommendation
    }

# Made with Bob

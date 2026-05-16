import re

def analyze_changes(diff_text: str) -> list[str]:
    """Performs lightweight heuristic static analysis on the git diff."""
    issues = []
    
    # 1. Check for basic 'TODO' or 'FIXME'
    if "TODO" in diff_text or "FIXME" in diff_text:
        issues.append("Change contains unresolved TODO/FIXME comments.")
        
    # 2. Check for potential print statements left in production
    if re.search(r"\+.*print\(", diff_text):
        issues.append("Change contains print() statements. Consider using a logger.")
        
    # 3. Check for potential hardcoded secrets
    secret_patterns = ["password", "api_key", "secret", "token"]
    for pattern in secret_patterns:
        if re.search(rf"\+.*{pattern}\s*=\s*['\"][^'\"]+['\"]", diff_text, re.IGNORECASE):
            issues.append(f"Potential hardcoded secret detected: '{pattern}'")
            
    # 4. Check for broken imports (simple heuristic: import added but not used in diff)
    # Note: This is limited since we don't have the full file context here, 
    # but good for a basic check.
    
    return issues

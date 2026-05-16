import os
import re
from git import Repo

def initialize_repo(repo_path: str):
    repo = Repo.init(repo_path)
    
    # If the repo doesn't have any commits yet (like an uploaded zip)
    if not repo.head.is_valid():
        repo.git.add(A=True)
        repo.index.commit("initial snapshot")
    else:
        # If it was cloned but has untracked/dirty files
        if repo.is_dirty(untracked_files=True):
            repo.git.add(A=True)
            repo.index.commit("initial snapshot")

def get_diff(repo_path: str) -> str:
    repo = Repo(repo_path)
    
    try:
        # Try to pull latest changes from GitHub
        origin = repo.remotes.origin
        old_commit = repo.head.commit
        origin.pull()
        new_commit = repo.head.commit
        
        # If GitHub had new changes, return the diff of what was just pulled!
        if old_commit != new_commit:
            return repo.git.diff(old_commit, new_commit)
        else:
            # If no new changes were pulled (e.g. user re-clicked 'Analyze'),
            # return the diff of the most recent commit so they can still see the analysis.
            try:
                return repo.git.diff("HEAD~1", "HEAD")
            except Exception:
                # If there's only one commit, this might fail
                return ""
    except Exception:
        # If no remote exists (like an uploaded zip), just ignore and move on
        pass
        
    # Fallback: check for local uncommitted changes
    return repo.git.diff()

def extract_changed_functions(diff_text: str) -> list[str]:
    changed_items = set()
    lines = diff_text.split('\n')
    
    for line in lines:
        # Detect context from diff headers: @@ -19,6 +19,7 @@ class GraphBuilder:
        if line.startswith('@@'):
            parts = line.split('@@', 2)
            if len(parts) >= 3:
                context = parts[2].strip()
                if context.startswith('def '):
                    func_name = context[4:].split('(')[0].strip()
                    changed_items.add(func_name)
                elif context.startswith('class '):
                    class_name = context[6:].split(':')[0].split('(')[0].strip()
                    changed_items.add(class_name)
                    
        # Detect explicitly added or removed functions
        elif line.startswith('+def ') or line.startswith('-def '):
            match = re.match(r'^[+-]def\s+([a-zA-Z0-9_]+)\s*\(', line)
            if match:
                changed_items.add(match.group(1))
                
    return list(changed_items)

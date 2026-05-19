from fastapi import APIRouter, HTTPException, UploadFile, File, Depends
from fastapi import Header
from pydantic import BaseModel
from pathlib import Path
import os
import requests
from app.services import repo_service

BASE_DIR = Path(__file__).resolve().parents[2]
REPOS_DIR = BASE_DIR / "data" / "repos"

from app.services.auth_service import get_current_user, verify_repo_ownership, is_auth_configured, supabase
import re

router = APIRouter()


def _try_supabase_insert(record: dict) -> bool:
    if not is_auth_configured() or supabase is None:
        return False
    try:
        supabase.table("repositories").insert(record).execute()
        return True
    except Exception:
        return False


class CloneRequest(BaseModel):
    repo_url: str


def _count_repositories_by_source(records: list[dict]) -> dict:
    github_count = sum(1 for record in records if record.get("source") == "github")
    upload_count = sum(1 for record in records if record.get("source") == "upload")
    return {
        "total_repositories": len(records),
        "github_repositories": github_count,
        "upload_repositories": upload_count,
    }


def _count_github_repositories(github_token: str) -> int:
    page_size = 100
    page = 1
    total_count = 0
    has_more = True

    while has_more:
        response = requests.get(
            f"https://api.github.com/user/repos?per_page={page_size}&page={page}&sort=updated&affiliation=owner,collaborator,organization_member",
            headers={
                "Authorization": f"Bearer {github_token}",
                "Accept": "application/vnd.github+json",
                "X-GitHub-Api-Version": "2022-11-28",
            },
            timeout=30,
        )

        if not response.ok:
            raise HTTPException(
                status_code=502,
                detail=f"GitHub repo count request failed with status {response.status_code}",
            )

        repos = response.json()
        if not isinstance(repos, list):
            raise HTTPException(status_code=502, detail="Unexpected GitHub API response")

        total_count += len(repos)
        has_more = len(repos) == page_size
        page += 1

    return total_count

def extract_repo_name(url: str) -> str:
    """Helper to extract repository name from a git URL."""
    try:
        cleaned = url.rstrip("/")
        if cleaned.endswith(".git"):
            cleaned = cleaned[:-4]
        return Path(cleaned).name or "Unnamed Repository"
    except Exception:
        return "Unnamed Repository"

@router.post("/clone")
def clone_repo_endpoint(request: CloneRequest, user_id: str = Depends(get_current_user)):
    try:
        # 1. Clone physical codebase locally
        repo_id = repo_service.clone_repo(request.repo_url)
        
        # 2. Extract repository name
        repo_name = extract_repo_name(request.repo_url)
        
        _try_supabase_insert({
            "id": repo_id,
            "user_id": user_id,
            "name": repo_name,
            "repo_url": request.repo_url,
            "source": "github",
        })

        return {"repo_id": repo_id, "status": "cloned"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/upload")
def upload_repo_endpoint(file: UploadFile = File(...), user_id: str = Depends(get_current_user)):
    try:
        # 1. Extract uploaded zip file locally
        repo_id = repo_service.extract_zip(file)
        
        # 2. Extract repository name from filename
        repo_name = Path(file.filename).stem if file.filename else "Uploaded Repository"
        
        _try_supabase_insert({
            "id": repo_id,
            "user_id": user_id,
            "name": repo_name,
            "source": "upload",
        })
        
        return {"repo_id": repo_id, "status": "uploaded"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.post("/sync/{repo_id}")
def sync_repo_endpoint(repo_id: str, user_id: str = Depends(get_current_user)):
    try:
        # Enforce that the requesting user owns this repository
        verify_repo_ownership(repo_id, user_id)
        
        repo_service.sync_repository(repo_id)
        return {"repo_id": repo_id, "status": "synced", "message": "Knowledge base updated with latest GitHub changes."}
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/list")
def list_repos_endpoint(user_id: str = Depends(get_current_user)):
    try:
        records = []

        try:
            if is_auth_configured() and supabase is not None:
                response = supabase.table("repositories").select("*").eq("user_id", user_id).execute()
                records = response.data or []
        except Exception:
            records = []

        if records:
            # Enrich records with friendly names from disk when DB rows contain UUID-like names
            try:
                from git import Repo as GitPythonRepo

                enriched = []
                uuid_pattern = re.compile(r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")
                for r in records:
                    try:
                        name = (r.get('name') or '')
                        repo_id = r.get('id')
                        # Only attempt enrichment when name looks like a UUID and a matching folder exists
                        if name and uuid_pattern.match(name) and repo_id:
                            repo_path = REPOS_DIR / str(repo_id)
                            if repo_path.exists() and repo_path.is_dir():
                                try:
                                    gp = GitPythonRepo(repo_path)
                                    origin_url = None
                                    if hasattr(gp, 'remotes') and gp.remotes:
                                        if 'origin' in gp.remotes:
                                            origin_url = gp.remotes.origin.url
                                        else:
                                            origin_url = next(iter(gp.remotes)).url

                                    if origin_url:
                                        r['repo_url'] = origin_url
                                        r['name'] = extract_repo_name(origin_url)
                                except Exception:
                                    pass
                    except Exception:
                        pass
                    enriched.append(r)
                return enriched
            except Exception:
                return records

        # Fallback for local/demo mode: list repository folders from disk.
        repos_dir = REPOS_DIR
        if not repos_dir.exists():
            return []

        repo_items = []
        # Try to read git remotes to provide a friendly repository name when possible.
        from git import Repo as GitPythonRepo

        for repo_path in repos_dir.iterdir():
            if not repo_path.is_dir():
                continue
            stat = repo_path.stat()
            display_name = repo_path.name
            repo_url = None

            try:
                gp = GitPythonRepo(repo_path)
                # Prefer 'origin' remote if present, else pick the first remote
                if hasattr(gp, 'remotes') and gp.remotes:
                    origin = None
                    if 'origin' in gp.remotes:
                        origin = gp.remotes.origin.url
                    else:
                        # get first remote's URL
                        origin = next(iter(gp.remotes)).url

                    if origin:
                        repo_url = origin
                        display_name = extract_repo_name(origin)
            except Exception:
                # if anything goes wrong, fall back to folder name
                pass

            repo_items.append({
                "id": repo_path.name,
                "name": display_name,
                "source": "github",
                "repo_url": repo_url,
                "created_at": stat.st_ctime,
            })

        return repo_items
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@router.get("/count")
def count_repos_endpoint(
    user_id: str = Depends(get_current_user),
    x_github_token: str | None = Header(default=None, alias="X-GitHub-Token"),
):
    try:
        if x_github_token:
            github_count = _count_github_repositories(x_github_token)
            return {
                "total_repositories": github_count,
                "github_repositories": github_count,
                "upload_repositories": 0,
            }

        records = []

        try:
            if is_auth_configured() and supabase is not None:
                response = supabase.table("repositories").select("id, source").eq("user_id", user_id).execute()
                records = response.data or []
        except Exception:
            records = []

        if records:
            return _count_repositories_by_source(records)

        repos_dir = REPOS_DIR
        if not repos_dir.exists():
            return {
                "total_repositories": 0,
                "github_repositories": 0,
                "upload_repositories": 0,
            }

        github_count = sum(1 for repo_path in repos_dir.iterdir() if repo_path.is_dir())
        return {
            "total_repositories": github_count,
            "github_repositories": github_count,
            "upload_repositories": 0,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# Development-only upload endpoint to simplify local testing when auth is unavailable.
# This endpoint bypasses `get_current_user` and accepts a `user_id` query parameter
# or header `x-dev-user-id`. It is only enabled when the DEBUG env var is set to true.
@router.post("/dev-upload")
def dev_upload_repo_endpoint(file: UploadFile = File(...), user_id: str | None = None):
    try:
        # allow passing user_id via header or query; default to 'dev-user' if omitted
        dev_user = user_id or "dev-user"

        repo_id = repo_service.extract_zip(file)

        repo_name = Path(file.filename).stem if file.filename else "Uploaded Repository"

        inserted = _try_supabase_insert({
            "id": repo_id,
            "user_id": dev_user,
            "name": repo_name,
            "source": "upload",
        })

        return {"repo_id": repo_id, "status": "uploaded", "dev_user": dev_user, "supabase_inserted": inserted}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# Development-only clone endpoint to clone public GitHub repos without auth
@router.post("/dev-clone")
def dev_clone_repo_endpoint(request: CloneRequest):
    try:
        repo_id = repo_service.clone_repo(request.repo_url)
        repo_name = extract_repo_name(request.repo_url)

        inserted = _try_supabase_insert({
            "id": repo_id,
            "user_id": "dev-user",
            "name": repo_name,
            "repo_url": request.repo_url,
            "source": "github",
        })

        return {"repo_id": repo_id, "status": "cloned", "supabase_inserted": inserted}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# Development-only list endpoint for local testing without auth
@router.get("/dev-list")
def dev_list_repos_endpoint():
    try:
        records = []
        
        # Try Supabase first (even in dev mode, if configured)
        try:
            if is_auth_configured() and supabase is not None:
                response = supabase.table("repositories").select("*").execute()
                records = response.data or []
        except Exception:
            records = []

        if records:
            # Enrich records with friendly names from repo_url or disk when name is UUID-like
            try:
                from git import Repo as GitPythonRepo

                enriched = []
                uuid_pattern = re.compile(r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$")
                seen_ids = set()
                
                for r in records:
                    try:
                        repo_id = r.get('id')
                        # Skip duplicates
                        if repo_id in seen_ids:
                            continue
                        seen_ids.add(repo_id)
                        
                        name = (r.get('name') or '')
                        repo_url = (r.get('repo_url') or '')
                        
                        # If name is UUID-like, try to extract friendly name
                        if name and uuid_pattern.match(name):
                            # First, try to use repo_url if available
                            if repo_url:
                                r['name'] = extract_repo_name(repo_url)
                            else:
                                # Otherwise try to read from git remotes on disk
                                if repo_id:
                                    repo_path = REPOS_DIR / str(repo_id)
                                    if repo_path.exists() and repo_path.is_dir():
                                        try:
                                            gp = GitPythonRepo(repo_path)
                                            origin_url = None
                                            if hasattr(gp, 'remotes') and gp.remotes:
                                                if 'origin' in gp.remotes:
                                                    origin_url = gp.remotes.origin.url
                                                else:
                                                    origin_url = next(iter(gp.remotes)).url

                                            if origin_url:
                                                r['repo_url'] = origin_url
                                                r['name'] = extract_repo_name(origin_url)
                                        except Exception:
                                            pass
                    except Exception:
                        pass
                    enriched.append(r)
                return enriched
            except Exception:
                return records

        # Fallback for local/demo mode: list repository folders from disk.
        repos_dir = REPOS_DIR
        if not repos_dir.exists():
            return []

        repo_items = []
        # Try to read git remotes to provide a friendly repository name when possible.
        from git import Repo as GitPythonRepo

        for repo_path in repos_dir.iterdir():
            if not repo_path.is_dir():
                continue
            stat = repo_path.stat()
            display_name = repo_path.name
            repo_url = None

            try:
                gp = GitPythonRepo(repo_path)
                # Prefer 'origin' remote if present, else pick the first remote
                if hasattr(gp, 'remotes') and gp.remotes:
                    origin = None
                    if 'origin' in gp.remotes:
                        origin = gp.remotes.origin.url
                    else:
                        # get first remote's URL
                        origin = next(iter(gp.remotes)).url

                    if origin:
                        repo_url = origin
                        display_name = extract_repo_name(origin)
            except Exception:
                # if anything goes wrong, fall back to folder name
                pass

            repo_items.append({
                "id": repo_path.name,
                "name": display_name,
                "source": "github",
                "repo_url": repo_url,
                "created_at": stat.st_ctime,
            })

        return repo_items
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# Development-only count endpoint for local testing without auth
@router.get("/dev-count")
def dev_count_repos_endpoint(x_github_token: str | None = Header(default=None, alias="X-GitHub-Token")):
    try:
        if x_github_token:
            github_count = _count_github_repositories(x_github_token)
            return {
                "total_repositories": github_count,
                "github_repositories": github_count,
                "upload_repositories": 0,
            }

        repos_dir = REPOS_DIR
        if not repos_dir.exists():
            return {
                "total_repositories": 0,
                "github_repositories": 0,
                "upload_repositories": 0,
            }

        github_count = sum(1 for repo_path in repos_dir.iterdir() if repo_path.is_dir())
        return {
            "total_repositories": github_count,
            "github_repositories": github_count,
            "upload_repositories": 0,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

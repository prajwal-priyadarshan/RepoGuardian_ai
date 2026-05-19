import os
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from dotenv import load_dotenv

from app.utils.debug_log import debug_log
from app.utils.dev_mode import is_debug_env

load_dotenv(override=True)

SUPABASE_URL = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = (
    os.getenv("VITE_SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")
)

AUTH_CONFIGURED = bool(SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY)
supabase: Client | None = None

if AUTH_CONFIGURED:
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    debug_log(
        "A",
        "auth_service.py:init",
        "Supabase client initialized",
        {"auth_configured": True, "debug_env": is_debug_env()},
    )
else:
    debug_log(
        "A",
        "auth_service.py:init",
        "Supabase not configured; using local dev auth fallback",
        {"auth_configured": False, "debug_env": is_debug_env()},
    )

security = HTTPBearer(auto_error=False)


def is_auth_configured() -> bool:
    return AUTH_CONFIGURED and supabase is not None


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
) -> str:
    if not is_auth_configured():
        debug_log(
            "E",
            "auth_service.py:get_current_user",
            "Dev fallback user (auth not configured)",
            {},
        )
        return "dev-user"

    if not credentials or not credentials.credentials:
        raise HTTPException(status_code=401, detail="Missing authorization token.")

    token = credentials.credentials
    try:
        user_response = supabase.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(status_code=401, detail="Invalid session token.")
        return str(user_response.user.id)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")


def verify_repo_ownership(
    repo_id: str,
    user_id: str = Depends(get_current_user),
) -> str:
    if not is_auth_configured():
        return repo_id

    try:
        response = (
            supabase.table("repositories")
            .select("id")
            .eq("id", repo_id)
            .eq("user_id", user_id)
            .execute()
        )
        if not response or not response.data:
            raise HTTPException(
                status_code=403,
                detail="Access denied: You do not own this repository.",
            )
        return repo_id
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database check failed: {str(e)}")

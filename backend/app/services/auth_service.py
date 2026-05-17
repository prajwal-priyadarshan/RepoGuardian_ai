import os
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import create_client, Client
from dotenv import load_dotenv

# Force load latest environment variables
load_dotenv(override=True)

# Support both with and without VITE_ prefix for maximum compatibility
SUPABASE_URL = os.getenv("VITE_SUPABASE_URL") or os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("VITE_SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    raise ValueError(
        "Supabase credentials are missing. Please add VITE_SUPABASE_URL and "
        "VITE_SUPABASE_SERVICE_ROLE_KEY to your backend .env file."
    )

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

# Security scheme for Bearer token extraction
security = HTTPBearer()

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """FastAPI dependency to extract and verify the Supabase JWT from requests."""
    token = credentials.credentials
    try:
        # Request Supabase Auth GoTrue API to retrieve user details from the JWT
        user_response = supabase.auth.get_user(token)
        if not user_response or not user_response.user:
            raise HTTPException(
                status_code=401,
                detail="Invalid session token."
            )
        return str(user_response.user.id)
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"Authentication failed: {str(e)}"
        )

def verify_repo_ownership(repo_id: str, user_id: str = Depends(get_current_user)) -> str:
    """Dependency to enforce multi-tenant separation by validating that the user owns the repository."""
    try:
        # Check ownership inside Supabase PostgreSQL 'repositories' table
        response = supabase.table("repositories").select("id").eq("id", repo_id).eq("user_id", user_id).execute()
        if not response or not response.data:
            raise HTTPException(
                status_code=403,
                detail="Access denied: You do not own this repository."
            )
        return repo_id
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Database check failed: {str(e)}"
        )

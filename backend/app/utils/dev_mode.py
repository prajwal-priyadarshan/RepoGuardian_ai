"""Shared local-development mode detection."""
import os


def is_debug_env() -> bool:
    return os.getenv("DEBUG", "false").lower() in ("1", "true", "yes")


def dev_endpoints_enabled() -> bool:
    """Dev-only API routes: explicit DEBUG=true or auth not configured locally."""
    if is_debug_env():
        return True
    try:
        from app.services.auth_service import is_auth_configured

        return not is_auth_configured()
    except Exception:
        return True

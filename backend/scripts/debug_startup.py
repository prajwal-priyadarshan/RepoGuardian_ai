"""Writes startup diagnostics to debug-2c2a23.log (agent debug session)."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.utils.debug_log import debug_log


def main() -> int:
    ok = True
    try:
        from app.main import app
        from app.services.auth_service import is_auth_configured
        from app.utils.dev_mode import dev_endpoints_enabled, is_debug_env

        debug_log(
            "A",
            "debug_startup.py",
            "Import app.main succeeded",
            {
                "title": app.title,
                "route_count": len(app.routes),
                "auth_configured": is_auth_configured(),
                "debug_env": is_debug_env(),
                "dev_endpoints_enabled": dev_endpoints_enabled(),
            },
            run_id="post-fix",
        )
        print("OK: backend imports and starts")
    except Exception as exc:
        ok = False
        debug_log(
            "A",
            "debug_startup.py",
            "Import app.main failed",
            {"error": str(exc)},
            run_id="post-fix",
        )
        print(f"FAIL: {exc}")
        raise

    return 0 if ok else 1


if __name__ == "__main__":
    raise SystemExit(main())

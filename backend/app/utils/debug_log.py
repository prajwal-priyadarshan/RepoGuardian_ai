"""NDJSON debug logging for agent debug sessions."""
import json
import time
from pathlib import Path

LOG_PATH = Path(__file__).resolve().parents[3] / "debug-2c2a23.log"
SESSION_ID = "2c2a23"


def debug_log(
    hypothesis_id: str,
    location: str,
    message: str,
    data: dict | None = None,
    run_id: str = "pre-fix",
) -> None:
    # #region agent log
    try:
        entry = {
            "sessionId": SESSION_ID,
            "runId": run_id,
            "hypothesisId": hypothesis_id,
            "location": location,
            "message": message,
            "data": data or {},
            "timestamp": int(time.time() * 1000),
        }
        with open(LOG_PATH, "a", encoding="utf-8") as f:
            f.write(json.dumps(entry) + "\n")
    except Exception:
        pass
    # #endregion

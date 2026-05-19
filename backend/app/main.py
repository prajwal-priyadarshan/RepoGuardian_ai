from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import repo, impact, embedding, ai, self_heal, pr, git, scan, parse, graph
from app.services.auth_service import is_auth_configured
from app.utils.debug_log import debug_log
from app.utils.dev_mode import dev_endpoints_enabled, is_debug_env


@asynccontextmanager
async def lifespan(app: FastAPI):
    # #region agent log
    debug_log(
        "A",
        "main.py:lifespan",
        "Backend startup",
        {
            "auth_configured": is_auth_configured(),
            "debug_env": is_debug_env(),
            "dev_endpoints_enabled": dev_endpoints_enabled(),
        },
    )
    # #endregion
    yield


app = FastAPI(
    title="RepoGuardian AI",
    description="AI-powered repository analysis and self-healing system",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(repo.router, prefix="/repo", tags=["Repository"])
app.include_router(scan.router, prefix="/scan", tags=["Scanning"])
app.include_router(parse.router, prefix="/parse", tags=["Parsing"])
app.include_router(graph.router, prefix="/graph", tags=["Graph"])
app.include_router(embedding.router, prefix="/embeddings", tags=["Embeddings"])
app.include_router(git.router, prefix="/git", tags=["Git"])
app.include_router(impact.router, prefix="/impact", tags=["Impact Analysis"])
app.include_router(ai.router, prefix="/ai", tags=["AI Analysis"])
app.include_router(self_heal.router, prefix="/self-heal", tags=["Self-Healing"])
app.include_router(pr.router, prefix="/pr", tags=["Pull Requests"])


@app.get("/", tags=["Health"])
def read_root():
    return {
        "status": "running",
        "service": "RepoGuardian AI",
        "version": "1.0.0",
        "auth_configured": is_auth_configured(),
        "dev_endpoints_enabled": dev_endpoints_enabled(),
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
        },
    }


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "RepoGuardian AI Backend",
        "auth_configured": is_auth_configured(),
        "dev_endpoints_enabled": dev_endpoints_enabled(),
    }

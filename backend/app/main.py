from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import repo, impact, embedding, ai, self_heal, pr, git, scan, parse, graph

app = FastAPI(
    title="RepoGuardian AI",
    description="AI-powered repository analysis and self-healing system",
    version="1.0.0"
)

# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register all routers
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
        "endpoints": {
            "docs": "/docs",
            "health": "/health"
        }
    }

@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "RepoGuardian AI Backend"
    }

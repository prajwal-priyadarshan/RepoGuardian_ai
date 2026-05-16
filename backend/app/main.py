from fastapi import FastAPI
from app.routes import repo, impact, embedding, ai, self_heal

app = FastAPI(title="RepoGuardian AI")

app.include_router(repo.router, prefix="/repo")
app.include_router(impact.router, prefix="/impact")
app.include_router(embedding.router, prefix="/embeddings")
app.include_router(ai.router, prefix="/ai")
app.include_router(self_heal.router, prefix="/self-heal")

@app.get("/")
def read_root():
    return "RepoGuardian AI running"

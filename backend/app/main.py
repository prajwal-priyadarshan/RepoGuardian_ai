from fastapi import FastAPI
from app.routes import repo, scan, parse, graph, impact, git, embedding, ai, self_heal

app = FastAPI(title="RepoGuardian AI")

app.include_router(repo.router, prefix="/repo")
app.include_router(scan.router, prefix="/scan")
app.include_router(parse.router, prefix="/parse")
app.include_router(graph.router, prefix="/graph")
app.include_router(impact.router, prefix="/impact")
app.include_router(git.router, prefix="/git")
app.include_router(embedding.router, prefix="/embeddings")
app.include_router(ai.router, prefix="/ai")
app.include_router(self_heal.router, prefix="/self-heal")

@app.get("/")
def read_root():
    return "RepoGuardian AI running"

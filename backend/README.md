# 🔧 RepoGuardian AI - Backend

**FastAPI-based backend for autonomous repository intelligence and self-healing**

---

## 📋 Overview

The RepoGuardian AI backend is a comprehensive REST API built with FastAPI that provides:
- Multi-language code parsing (6 languages)
- Neo4j graph database for dependency tracking
- Pinecone vector database for semantic search
- Groq Llama 3.3 AI integration for code analysis
- Self-healing with validation pipeline
- GitHub PR automation

---

## 🏗️ Architecture

### Service Layer
```
app/
├── main.py                    # FastAPI application + CORS
├── routes/                    # API endpoints (10 modules)
│   ├── repo.py               # Repository management
│   ├── scan.py               # File scanning
│   ├── parse.py              # Code parsing
│   ├── graph.py              # Graph operations
│   ├── embedding.py          # Vector embeddings
│   ├── git.py                # Git operations
│   ├── impact.py             # Impact analysis
│   ├── ai.py                 # AI analysis
│   ├── self_heal.py          # Self-healing
│   └── pr.py                 # PR generation
└── services/                  # Business logic (11 modules)
    ├── repo_service.py       # Clone, upload, sync
    ├── file_scanner.py       # Smart file traversal
    ├── parser_service.py     # Tree-sitter AST parsing
    ├── graph_service.py      # Neo4j integration
    ├── embedding_service.py  # Pinecone + Gemini
    ├── git_service.py        # Git diff & extraction
    ├── impact_service.py     # Risk calculation
    ├── static_analysis_service.py  # Security checks
    ├── ai_service.py         # Groq AI integration
    ├── self_healing_service.py     # Auto-fix pipeline
    └── pr_service.py         # GitHub PR creation
```

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Configure Environment
Create `.env` file:
```env
# Neo4j (Graph Database)
NEO4J_URI=neo4j+ssc://xxxxx.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password

# Pinecone (Vector Database)
PINECONE_API_KEY=your_api_key
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX_NAME=repoguardian-gemini

# AI Models
GEMINI_API_KEY=your_gemini_key  # For embeddings
GROQ_API_KEY=your_groq_key      # For AI analysis
```

### 3. Start Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Server runs at: `http://localhost:8000`

### 4. Verify Installation
```bash
# Quick verification
python quick_test.py

# Comprehensive testing
python test_all_endpoints.py
```

---

## 📚 API Documentation

### Interactive Docs
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Complete Reference
See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for detailed endpoint specifications.

### Quick Reference

| Category | Endpoints | Description |
|----------|-----------|-------------|
| **Health** | `GET /`, `GET /health` | Service status |
| **Repository** | `POST /repo/clone`, `POST /repo/upload`, `POST /repo/sync/{id}` | Repo management |
| **Scanning** | `GET /scan/{id}`, `GET /parse/{id}` | Code analysis |
| **Graph** | `POST /graph/build/{id}`, `DELETE /graph/clear` | Dependency mapping |
| **Embeddings** | `POST /embeddings/store/{id}`, `POST /embeddings/query` | Vector search |
| **Git** | `POST /git/diff/{id}` | Change detection |
| **Impact** | `POST /impact/analyze` | Risk assessment |
| **AI** | `POST /ai/analyze`, `POST /ai/analyze/manual` | AI reasoning |
| **Self-Heal** | `POST /self-heal/` | Auto-fix |
| **PR** | `POST /pr/generate`, `POST /pr/patch`, `POST /pr/summary` | PR automation |

---

## 🔧 Core Services

### 1. Parser Service
**File**: `app/services/parser_service.py`

**Supported Languages**:
- Python (.py)
- JavaScript (.js, .jsx)
- TypeScript (.ts, .tsx)
- Java (.java)
- C/C++ (.c, .cpp)

**Extracts**:
- Functions and methods
- Classes and interfaces
- Import statements
- Function calls

**Example**:
```python
from app.services import parser_service

parsed_data = parser_service.parse_repository(repo_id)
# Returns: List of file data with functions, classes, imports
```

### 2. Graph Service
**File**: `app/services/graph_service.py`

**Graph Schema**:
```cypher
// Nodes
(f:File {name, repo_id})
(func:Function {name, repo_id})
(cls:Class {name, repo_id})

// Relationships
(func)-[:DEFINED_IN]->(f)
(func)-[:CALLS]->(other_func)
(f)-[:IMPORTS]->(other_f)
```

**Example**:
```python
from app.services.graph_service import GraphService

service = GraphService()
service.build_graph(repo_id)
# Builds complete dependency graph in Neo4j
```

### 3. Impact Service
**File**: `app/services/impact_service.py`

**Risk Calculation**:
```python
Risk Score = (Affected Nodes × Depth × Criticality)

Risk Levels:
- LOW: < 5
- MEDIUM: 5-15
- HIGH: > 15
```

**Example**:
```python
from app.services import impact_service

impact = impact_service.analyze_impact("validate_user", repo_id)
# Returns: affected_files, risk_score, depth, semantic_context
```

### 4. AI Service
**File**: `app/services/ai_service.py`

**Model**: Groq Llama 3.3 70B Versatile

**Output Structure**:
```python
{
    "explanation": "What impact this change has",
    "risks": ["List of potential bugs"],
    "why_breaks": "Why it breaks downstream",
    "suggestions": ["List of fixes"],
    "fixed_code": "Corrected code"
}
```

**Example**:
```python
from app.services import ai_service

analysis = ai_service.analyze_code_change({
    "function": "validate_user",
    "changed_code": "git diff output",
    "dependencies": ["file1.py", "file2.py"],
    "context": ["semantic context"],
    "issues": ["static analysis issues"]
})
```

### 5. Self-Healing Service
**File**: `app/services/self_healing_service.py`

**Pipeline**:
```
1. Create backup (.bak file)
2. Apply AI-generated fix
3. Validate syntax (py_compile)
4. Run static analysis
5. Check security issues
6. If valid: Commit to git
7. If invalid: Rollback from backup
```

**Example**:
```python
from app.services import self_healing_service

result = self_healing_service.run_self_healing(
    repo_id, 
    "auth.py", 
    fixed_code
)
# Returns: status, message, rollback flag
```

---

## 🧪 Testing

### Quick Test
```bash
python quick_test.py
```
Verifies:
- All imports working
- Routes registered
- Services available
- Environment configured

### Comprehensive Test
```bash
python test_all_endpoints.py
```
Tests:
- All 30 API endpoints
- End-to-end workflows
- Error handling
- Response validation

### Connection Tests
```bash
# Test Neo4j
python test_neo4j.py

# Test all services
python test_connections.py
```

---

## 📊 Performance

### Benchmarks
```
Graph Building: ~2-5s for medium repos (1000 files)
Embeddings: ~10-30s (one-time per repo)
Impact Analysis: ~1-3s
AI Analysis: ~2-5s per function (Groq is fast!)
Self-Healing: ~5-10s with validation
PR Generation: ~3-7s
```

### Optimization Tips
1. **Use Batch Operations**: Graph service uses batch inserts
2. **Cache Embeddings**: Store in Pinecone, query when needed
3. **Async Operations**: FastAPI supports async endpoints
4. **Connection Pooling**: Neo4j driver handles connection pooling

---

## 🔒 Security

### API Key Management
- Store in `.env` file (never commit)
- Use environment variables
- Rotate keys regularly

### Input Validation
- Pydantic models for request validation
- Type checking throughout
- SQL injection prevention (parameterized queries)

### Static Analysis
- Security checks in self-healing pipeline
- Detects hardcoded secrets
- Validates code quality

---

## 🐛 Troubleshooting

### Common Issues

#### 1. Neo4j Connection Failed
```bash
# Check credentials in .env
NEO4J_URI=neo4j+ssc://xxxxx.databases.neo4j.io
NEO4J_USER=neo4j
NEO4J_PASSWORD=your_password

# Test connection
python test_neo4j.py
```

#### 2. Pinecone Index Not Found
```bash
# Create index in Pinecone dashboard
# Dimension: 3072 (for Gemini embeddings)
# Metric: cosine
```

#### 3. Groq API Rate Limit
```bash
# Free tier: 30 requests/minute
# Solution: Add retry logic or upgrade plan
```

#### 4. Tree-sitter Parse Error
```bash
# Ensure language bindings installed
pip install tree-sitter-python tree-sitter-javascript
```

---

## 📈 Monitoring

### Logs
```bash
# View server logs
uvicorn app.main:app --reload --log-level debug
```

### Health Check
```bash
curl http://localhost:8000/health
```

### Metrics
- Request count per endpoint
- Response times
- Error rates
- Database query performance

---

## 🚀 Deployment

### Docker (Recommended)
```dockerfile
FROM python:3.12-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Cloud Deployment
1. **AWS**: Elastic Beanstalk or ECS
2. **GCP**: Cloud Run or App Engine
3. **Azure**: App Service
4. **Render**: Native Python support

### Environment Variables
Ensure all required variables are set in production:
- NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD
- PINECONE_API_KEY, PINECONE_INDEX_NAME
- GEMINI_API_KEY, GROQ_API_KEY

---

## 📝 Development

### Adding New Endpoints
1. Create route in `app/routes/`
2. Implement service in `app/services/`
3. Register router in `app/main.py`
4. Add tests in `test_all_endpoints.py`
5. Document in `API_DOCUMENTATION.md`

### Code Style
- Follow PEP 8
- Use type hints
- Add docstrings
- Handle errors gracefully

### Git Workflow
```bash
git checkout -b feature/new-feature
# Make changes
git commit -m "Add new feature"
git push origin feature/new-feature
# Create PR
```

---

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Neo4j Python Driver](https://neo4j.com/docs/python-manual/current/)
- [Pinecone Documentation](https://docs.pinecone.io/)
- [Tree-sitter Documentation](https://tree-sitter.github.io/tree-sitter/)
- [Groq API Documentation](https://console.groq.com/docs)

---

## 🤝 Contributing

See main [README.md](../README.md) for contribution guidelines.

---

## 📄 License

MIT License - See [LICENSE](../LICENSE) for details.

---

<div align="center">

**Built with FastAPI ⚡**

[⬆ Back to Main README](../README.md)

</div>
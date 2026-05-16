# RepoGuardian AI - API Documentation

## Base URL
```
http://localhost:8000
```

## Table of Contents
1. [Health Endpoints](#health-endpoints)
2. [Repository Management](#repository-management)
3. [Code Scanning & Parsing](#code-scanning--parsing)
4. [Graph Operations](#graph-operations)
5. [Embeddings & Vector Search](#embeddings--vector-search)
6. [Git Operations](#git-operations)
7. [Impact Analysis](#impact-analysis)
8. [AI Analysis](#ai-analysis)
9. [Self-Healing](#self-healing)
10. [Pull Request Generation](#pull-request-generation)

---

## Health Endpoints

### GET /
**Description:** Root endpoint with service information

**Response:**
```json
{
  "status": "running",
  "service": "RepoGuardian AI",
  "version": "1.0.0",
  "endpoints": {
    "docs": "/docs",
    "health": "/health"
  }
}
```

### GET /health
**Description:** Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "service": "RepoGuardian AI Backend"
}
```

---

## Repository Management

### POST /repo/clone
**Description:** Clone a GitHub repository

**Request Body:**
```json
{
  "repo_url": "https://github.com/username/repo.git"
}
```

**Response:**
```json
{
  "repo_id": "uuid-string",
  "status": "cloned"
}
```

**Notes:**
- Automatically triggers parsing, graph building, and embedding generation
- Returns a unique `repo_id` for all subsequent operations

### POST /repo/upload
**Description:** Upload a repository as a ZIP file

**Request:** Multipart form data with file

**Response:**
```json
{
  "repo_id": "uuid-string",
  "status": "uploaded"
}
```

### POST /repo/sync/{repo_id}
**Description:** Sync repository with latest GitHub changes

**Parameters:**
- `repo_id` (path): Repository UUID

**Response:**
```json
{
  "repo_id": "uuid-string",
  "status": "synced",
  "message": "Knowledge base updated with latest GitHub changes."
}
```

---

## Code Scanning & Parsing

### GET /scan/{repo_id}
**Description:** Scan repository for all code files

**Parameters:**
- `repo_id` (path): Repository UUID

**Response:**
```json
{
  "repo_id": "uuid-string",
  "files": [
    "src/main.py",
    "src/utils.py",
    "tests/test_main.py"
  ]
}
```

**Notes:**
- Automatically filters out `node_modules`, `.git`, and build directories

### GET /parse/{repo_id}
**Description:** Parse repository code structure using Tree-sitter

**Parameters:**
- `repo_id` (path): Repository UUID

**Response:**
```json
{
  "repo_id": "uuid-string",
  "parsed_data": [
    {
      "file": "src/main.py",
      "functions": [
        {
          "name": "main",
          "calls": ["initialize", "run"]
        }
      ],
      "classes": [
        {
          "name": "Application",
          "methods": []
        }
      ],
      "imports": [
        "import os",
        "from utils import helper"
      ]
    }
  ]
}
```

**Supported Languages:**
- Python (.py)
- JavaScript (.js, .jsx)
- TypeScript (.ts, .tsx)
- Java (.java)
- C/C++ (.c, .cpp)

---

## Graph Operations

### POST /graph/build/{repo_id}
**Description:** Build dependency graph in Neo4j

**Parameters:**
- `repo_id` (path): Repository UUID

**Response:**
```json
{
  "repo_id": "uuid-string",
  "status": "graph_built"
}
```

**Graph Structure:**
- **Nodes:** File, Function, Class
- **Relationships:** DEFINED_IN, CALLS, IMPORTS

### DELETE /graph/clear
**Description:** Clear entire Neo4j database (development only)

**Response:**
```json
{
  "status": "success",
  "message": "Database wiped successfully!"
}
```

---

## Embeddings & Vector Search

### POST /embeddings/store/{repo_id}
**Description:** Generate and store embeddings in Pinecone

**Parameters:**
- `repo_id` (path): Repository UUID

**Response:**
```json
{
  "status": "success",
  "message": "Embeddings stored successfully for repo uuid-string"
}
```

**Notes:**
- Uses Google Gemini embeddings (3072 dimensions)
- Stores function definitions with metadata

### POST /embeddings/query
**Description:** Query embeddings for semantic code search

**Request Body:**
```json
{
  "query": "authentication function",
  "repo_id": "uuid-string"
}
```

**Response:**
```json
{
  "results": [
    "Function 'authenticate_user' is defined in file 'auth.py'.",
    "Function 'validate_token' is defined in file 'auth.py'."
  ]
}
```

---

## Git Operations

### POST /git/diff/{repo_id}
**Description:** Get git diff and extract changed functions

**Parameters:**
- `repo_id` (path): Repository UUID

**Response:**
```json
{
  "changed_functions": ["validate_user", "login"],
  "raw_diff": "diff --git a/auth.py b/auth.py\n..."
}
```

**Notes:**
- Automatically pulls latest changes from GitHub if remote exists
- Falls back to local uncommitted changes

---

## Impact Analysis

### POST /impact/analyze
**Description:** Analyze impact of code changes

**Request Body:**
```json
{
  "repo_id": "uuid-string"
}
```

**Response:**
```json
{
  "changed_functions": {
    "added": [],
    "removed": [],
    "modified": ["validate_user"],
    "raw_diff": "..."
  },
  "impact": [
    {
      "function": "validate_user",
      "affected_files": ["auth.py", "login.py", "payment.py"],
      "risk_score": 12.5,
      "depth": 3,
      "semantic_context": [
        "Function 'validate_user' is defined in file 'auth.py'."
      ],
      "static_issues": [
        "Change contains print() statements. Consider using a logger."
      ]
    }
  ],
  "global_static_issues": []
}
```

**Risk Score Calculation:**
```
Risk = (affected_nodes × depth × criticality)
```

**Risk Levels:**
- LOW: < 5
- MEDIUM: 5-15
- HIGH: > 15

---

## AI Analysis

### POST /ai/analyze
**Description:** AI-powered code change analysis using Groq Llama-3.3

**Request Body:**
```json
{
  "repo_id": "uuid-string"
}
```

**Response:**
```json
{
  "repo_id": "uuid-string",
  "analyses": [
    {
      "explanation": "Changing validate_user affects authentication flow...",
      "risks": [
        "Breaking authentication in payment module",
        "Potential security vulnerability"
      ],
      "why_breaks": "The function signature changed, breaking downstream calls",
      "suggestions": [
        "Update all callers to use new signature",
        "Add backward compatibility layer"
      ],
      "fixed_code": "def validate_user(username, password, session=None):\n..."
    }
  ]
}
```

### POST /ai/analyze/manual
**Description:** Manual AI analysis for specific code changes

**Request Body:**
```json
{
  "repo_id": "uuid-string",
  "file_path": "src/auth.py",
  "function": "validate_user",
  "new_code": "def validate_user(username, password):\n    return True"
}
```

**Response:**
```json
{
  "repo_id": "uuid-string",
  "analysis": {
    "explanation": "...",
    "risks": [],
    "why_breaks": "...",
    "suggestions": [],
    "fixed_code": "..."
  }
}
```

---

## Self-Healing

### POST /self-heal/
**Description:** Autonomous self-healing with AI-generated fixes

**Request Body:**
```json
{
  "repo_id": "uuid-string"
}
```

**Response:**
```json
{
  "repo_id": "uuid-string",
  "summary": [
    {
      "entity": "validate_user",
      "file": "src/auth.py",
      "result": {
        "status": "applied",
        "message": "Validation passed. AI fix applied and committed.",
        "rollback": false
      }
    }
  ]
}
```

**Process:**
1. Detect changes via git diff
2. Run impact analysis
3. Generate AI fixes
4. Apply fixes to files
5. Validate syntax and static analysis
6. Commit if valid, rollback if invalid

**Status Values:**
- `applied`: Fix successfully applied and committed
- `failed`: Fix failed validation, rolled back
- `skipped`: No changes detected

---

## Pull Request Generation

### POST /pr/generate
**Description:** Complete PR generation pipeline

**Request Body:**
```json
{
  "repo_id": "uuid-string",
  "github_token": "ghp_xxxxx" // Optional
}
```

**Response:**
```json
{
  "repo_id": "uuid-string",
  "patch": {
    "type": "uncommitted",
    "file": "/path/to/latest.patch"
  },
  "summary": {
    "title": "[RepoGuardian AI] Automated Analysis - MEDIUM Risk",
    "risk_level": "MEDIUM",
    "risk_score": 8.5,
    "timestamp": "2026-05-16T16:30:00.000Z",
    "changed_entities": 3,
    "affected_files": ["auth.py", "login.py"],
    "affected_count": 2,
    "description": "## 🤖 RepoGuardian AI Analysis\n...",
    "recommendations": [
      "Update all callers to use new signature"
    ]
  },
  "pr_result": {
    "status": "success",
    "message": "Pull request created successfully",
    "pr_number": 42,
    "pr_url": "https://github.com/owner/repo/pull/42",
    "branch": "repoguardian-ai-20260516-163000"
  }
}
```

### POST /pr/patch
**Description:** Generate git patch only

**Request Body:**
```json
{
  "repo_id": "uuid-string"
}
```

**Response:**
```json
{
  "repo_id": "uuid-string",
  "patch": {
    "patch_file": "/path/to/latest.patch",
    "patch_content": "diff --git...",
    "type": "uncommitted"
  }
}
```

### POST /pr/summary
**Description:** Generate PR summary with impact and AI analysis

**Request Body:**
```json
{
  "repo_id": "uuid-string"
}
```

**Response:**
```json
{
  "repo_id": "uuid-string",
  "summary": {
    "title": "[RepoGuardian AI] Automated Analysis - LOW Risk",
    "risk_level": "LOW",
    "risk_score": 3.2,
    "timestamp": "2026-05-16T16:30:00.000Z",
    "changed_entities": 1,
    "affected_files": ["utils.py"],
    "affected_count": 1,
    "description": "...",
    "recommendations": []
  }
}
```

### POST /pr/risk-analysis
**Description:** Advanced PR risk analysis (Phase 12)

**Request Body:**
```json
{
  "repo_id": "uuid-string"
}
```

**Response:**
```json
{
  "repo_id": "uuid-string",
  "risk_analysis": {
    "risk_score": 8,
    "assessment": "MEDIUM_RISK",
    "risk_factors": [
      "Moderate number of affected files (5-10)",
      "Medium impact risk detected"
    ],
    "recommendation": "Review recommended, proceed with caution"
  },
  "pr_summary": {
    "title": "...",
    "risk_level": "MEDIUM",
    "risk_score": 8.5
  }
}
```

**Risk Assessment Levels:**
- `LOW_RISK`: Score < 5 - Safe to merge with standard review
- `MEDIUM_RISK`: Score 5-7 - Review recommended, proceed with caution
- `HIGH_RISK`: Score ≥ 8 - Requires thorough manual review before merging

---

## Complete Workflow Example

### 1. Clone Repository
```bash
POST /repo/clone
{
  "repo_url": "https://github.com/username/repo.git"
}
# Returns: { "repo_id": "abc-123" }
```

### 2. Make Changes (External)
```bash
# User makes changes in their IDE or via GitHub
```

### 3. Sync Repository
```bash
POST /repo/sync/abc-123
# Pulls latest changes and updates knowledge base
```

### 4. Analyze Impact
```bash
POST /impact/analyze
{
  "repo_id": "abc-123"
}
# Returns impact analysis with risk scores
```

### 5. Get AI Insights
```bash
POST /ai/analyze
{
  "repo_id": "abc-123"
}
# Returns AI-powered explanations and suggestions
```

### 6. Apply Self-Healing (Optional)
```bash
POST /self-heal/
{
  "repo_id": "abc-123"
}
# Automatically fixes issues and commits
```

### 7. Generate Pull Request
```bash
POST /pr/generate
{
  "repo_id": "abc-123",
  "github_token": "ghp_xxxxx"
}
# Creates PR with full analysis
```

---

## Error Responses

All endpoints return standard error responses:

```json
{
  "detail": "Error message describing what went wrong"
}
```

**Common Status Codes:**
- `200`: Success
- `400`: Bad Request (invalid parameters)
- `404`: Not Found (repo_id doesn't exist)
- `500`: Internal Server Error

---

## Environment Variables Required

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

---

## Interactive API Documentation

FastAPI provides automatic interactive documentation:

- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

## Rate Limits & Performance

- **Graph Operations:** ~2-5 seconds for medium repos
- **Embedding Generation:** ~10-30 seconds depending on repo size
- **AI Analysis:** ~2-5 seconds per function (Groq is fast!)
- **Self-Healing:** ~5-10 seconds including validation

**Recommendations:**
- Use `/repo/sync` instead of re-cloning for updates
- Embeddings and graph are built automatically on clone/upload
- AI analysis is on-demand to save API costs

---

## Support & Issues

For issues or questions, please refer to the project repository.
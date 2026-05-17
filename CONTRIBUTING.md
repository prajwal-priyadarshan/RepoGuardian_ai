# 🤝 Contributing to RepoGuardian AI

Thank you for your interest in contributing to RepoGuardian AI! This guide will help you get started.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation](#documentation)
- [Pull Request Process](#pull-request-process)
- [Issue Guidelines](#issue-guidelines)

---

## 📜 Code of Conduct

### Our Pledge
We are committed to providing a welcoming and inclusive environment for all contributors.

### Our Standards
- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

---

## 🚀 Getting Started

### 1. Fork the Repository
```bash
# Fork on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/RepoGuardian_ai.git
cd RepoGuardian_ai
```

### 2. Set Up Development Environment

#### Backend Setup
```bash
cd backend
pip install -r requirements.txt

# Copy environment template
cp .env.example .env
# Edit .env with your credentials

# Start backend
uvicorn app.main:app --reload
```

#### Frontend Setup
```bash
cd frontend
npm install

# Copy environment template
cp .env.example .env
# Edit .env with your API URL

# Start frontend
npm run dev
```

### 3. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

---

## 🔄 Development Workflow

### Branch Naming Convention
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates
- `chore/` - Maintenance tasks

**Examples:**
- `feature/add-rust-support`
- `fix/neo4j-connection-timeout`
- `docs/update-api-documentation`

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Code restructuring
- `test` - Tests
- `chore` - Maintenance

**Examples:**
```bash
feat(parser): add Rust language support

- Implement Tree-sitter Rust parser
- Add Rust file detection
- Update parser service tests

Closes #123
```

```bash
fix(graph): resolve Neo4j connection timeout

- Increase connection timeout to 30s
- Add retry logic for failed connections
- Improve error messages

Fixes #456
```

---

## 📁 Project Structure

### Backend (`backend/`)
```
app/
├── main.py              # FastAPI app
├── routes/              # API endpoints
│   ├── repo.py
│   ├── impact.py
│   └── ...
└── services/            # Business logic
    ├── parser_service.py
    ├── graph_service.py
    └── ...
```

### Frontend (`frontend/`)
```
src/
├── components/          # Reusable components
├── pages/              # Route pages
├── lib/                # Utilities
├── store/              # State management
└── types/              # TypeScript types
```

---

## 💻 Coding Standards

### Backend (Python)

#### Style Guide
- Follow [PEP 8](https://pep8.org/)
- Use type hints for all functions
- Maximum line length: 100 characters
- Use docstrings for all public functions

#### Example:
```python
from typing import List, Dict

def analyze_impact(function_name: str, repo_id: str) -> Dict[str, any]:
    """
    Analyze the impact of a function change.
    
    Args:
        function_name: Name of the changed function
        repo_id: Repository identifier
        
    Returns:
        Dictionary containing impact analysis results
        
    Raises:
        ValueError: If function_name is empty
        ConnectionError: If Neo4j connection fails
    """
    if not function_name:
        raise ValueError("function_name cannot be empty")
    
    # Implementation
    return {"function": function_name, "affected_files": []}
```

#### Code Quality
```bash
# Format code
black app/

# Check linting
flake8 app/

# Type checking
mypy app/
```

### Frontend (TypeScript)

#### Style Guide
- Use TypeScript strictly (no `any` types)
- Use functional components with hooks
- Follow React best practices
- Use meaningful variable names

#### Example:
```typescript
interface ImpactAnalysisProps {
  repoId: string;
  onAnalysisComplete: (result: ImpactResult) => void;
}

export const ImpactAnalysis: React.FC<ImpactAnalysisProps> = ({ 
  repoId, 
  onAnalysisComplete 
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await api.analyzeImpact({ repo_id: repoId });
      onAnalysisComplete(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};
```

#### Code Quality
```bash
# Lint code
npm run lint

# Type check
npx tsc --noEmit

# Format code
npx prettier --write src/
```

---

## 🧪 Testing Guidelines

### Backend Tests

#### Unit Tests
```python
# test_impact_service.py
import pytest
from app.services import impact_service

def test_analyze_impact_valid_function():
    result = impact_service.analyze_impact("test_func", "test_repo")
    assert "function" in result
    assert result["function"] == "test_func"

def test_analyze_impact_empty_function():
    with pytest.raises(ValueError):
        impact_service.analyze_impact("", "test_repo")
```

#### Integration Tests
```python
# test_api_endpoints.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
```

#### Run Tests
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app tests/

# Run specific test
pytest tests/test_impact_service.py::test_analyze_impact_valid_function
```

### Frontend Tests

#### Component Tests
```typescript
// ImpactAnalysis.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ImpactAnalysis } from './ImpactAnalysis';

describe('ImpactAnalysis', () => {
  it('renders analyze button', () => {
    render(<ImpactAnalysis repoId="test-123" onAnalysisComplete={jest.fn()} />);
    expect(screen.getByText('Analyze Impact')).toBeInTheDocument();
  });

  it('calls onAnalysisComplete when analysis succeeds', async () => {
    const mockCallback = jest.fn();
    render(<ImpactAnalysis repoId="test-123" onAnalysisComplete={mockCallback} />);
    
    fireEvent.click(screen.getByText('Analyze Impact'));
    
    await waitFor(() => {
      expect(mockCallback).toHaveBeenCalled();
    });
  });
});
```

#### Run Tests
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

---

## 📚 Documentation

### Code Documentation

#### Backend
- Add docstrings to all public functions
- Include parameter types and return types
- Document exceptions that can be raised
- Add usage examples for complex functions

#### Frontend
- Add JSDoc comments for complex functions
- Document component props with TypeScript interfaces
- Include usage examples in component files

### API Documentation
- Update `backend/API_DOCUMENTATION.md` for new endpoints
- Include request/response examples
- Document error responses
- Add workflow examples

### README Updates
- Update main README.md for major features
- Update backend/README.md for backend changes
- Update frontend/README.md for frontend changes

---

## 🔀 Pull Request Process

### Before Submitting

1. **Update Your Branch**
```bash
git checkout main
git pull origin main
git checkout your-feature-branch
git rebase main
```

2. **Run Tests**
```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm test
```

3. **Check Code Quality**
```bash
# Backend
black app/
flake8 app/

# Frontend
npm run lint
npx tsc --noEmit
```

4. **Update Documentation**
- Update relevant README files
- Update API documentation if needed
- Add comments to complex code

### Submitting PR

1. **Push Your Branch**
```bash
git push origin your-feature-branch
```

2. **Create Pull Request**
- Go to GitHub repository
- Click "New Pull Request"
- Select your branch
- Fill in PR template

### PR Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally

## Screenshots (if applicable)
Add screenshots for UI changes

## Related Issues
Closes #123
```

### Review Process

1. **Automated Checks**
   - CI/CD pipeline runs tests
   - Code quality checks
   - Build verification

2. **Code Review**
   - At least one approval required
   - Address reviewer comments
   - Update PR as needed

3. **Merge**
   - Squash and merge for clean history
   - Delete branch after merge

---

## 🐛 Issue Guidelines

### Creating Issues

#### Bug Report Template
```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g., Windows 11]
- Browser: [e.g., Chrome 120]
- Version: [e.g., 1.0.0]

**Additional context**
Any other relevant information
```

#### Feature Request Template
```markdown
**Is your feature request related to a problem?**
Clear description of the problem

**Describe the solution you'd like**
Clear description of desired solution

**Describe alternatives you've considered**
Alternative solutions or features

**Additional context**
Mockups, examples, or references
```

### Issue Labels

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Documentation improvements
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `priority: high` - High priority
- `priority: medium` - Medium priority
- `priority: low` - Low priority

---

## 🎯 Areas for Contribution

### High Priority
- [ ] Add support for more languages (Go, Rust, Ruby)
- [ ] Implement real-time WebSocket updates
- [ ] Add comprehensive unit test coverage
- [ ] Create Docker deployment configuration
- [ ] Improve error handling and logging

### Medium Priority
- [ ] GitHub Actions CI/CD pipeline
- [ ] Slack/Discord notification integration
- [ ] Custom risk scoring rules
- [ ] Multi-repository analysis
- [ ] Team collaboration features

### Low Priority
- [ ] Dark/light theme toggle
- [ ] Export analysis reports (PDF/CSV)
- [ ] Advanced visualization options
- [ ] Plugin system for extensions
- [ ] Mobile-responsive improvements

---

## 💡 Tips for Contributors

### For First-Time Contributors
1. Start with issues labeled `good first issue`
2. Read the documentation thoroughly
3. Ask questions in discussions
4. Don't hesitate to request help

### For Experienced Contributors
1. Look for `help wanted` issues
2. Propose architectural improvements
3. Help review other PRs
4. Mentor new contributors

### Best Practices
- Write clear, descriptive commit messages
- Keep PRs focused and small
- Add tests for new features
- Update documentation
- Be responsive to feedback

---

## 📞 Getting Help

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and general discussion
- **Pull Requests**: Code review and collaboration

### Resources
- [Main README](README.md)
- [Backend Documentation](backend/README.md)
- [Frontend Documentation](frontend/README.md)
- [API Documentation](backend/API_DOCUMENTATION.md)
- [IBM Bob Report](IBM_BOB_REPORT.md)

---

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to RepoGuardian AI! 🎉

---

<div align="center">

**Built by the community, for the community**

[⬆ Back to README](README.md)

</div>
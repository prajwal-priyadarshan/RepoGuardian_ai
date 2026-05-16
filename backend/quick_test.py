"""
Quick verification script to check if all endpoints are registered
Run this to verify the server configuration without making actual API calls
"""

import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

def test_imports():
    """Test if all modules can be imported"""
    print("Testing imports...")
    
    try:
        from app.main import app
        print("✓ Main app imported successfully")
        
        # Check routes
        routes = [route.path for route in app.routes]
        print(f"\n✓ Found {len(routes)} registered routes:")
        
        # Group by prefix
        route_groups = {}
        for route in routes:
            if hasattr(route, 'path'):
                prefix = route.split('/')[1] if '/' in route else 'root'
                if prefix not in route_groups:
                    route_groups[prefix] = []
                route_groups[prefix].append(route)
        
        for prefix, paths in sorted(route_groups.items()):
            print(f"\n  {prefix.upper()}:")
            for path in sorted(paths):
                print(f"    - {path}")
        
        return True
    except Exception as e:
        print(f"✗ Import failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_services():
    """Test if all services can be imported"""
    print("\n\nTesting services...")
    
    services = [
        'repo_service',
        'file_scanner',
        'parser_service',
        'graph_service',
        'embedding_service',
        'git_service',
        'impact_service',
        'static_analysis_service',
        'ai_service',
        'self_healing_service',
        'pr_service'
    ]
    
    all_ok = True
    for service in services:
        try:
            exec(f"from app.services import {service}")
            print(f"✓ {service}")
        except Exception as e:
            print(f"✗ {service}: {e}")
            all_ok = False
    
    return all_ok

def test_routes():
    """Test if all routes can be imported"""
    print("\n\nTesting routes...")
    
    routes = [
        'repo',
        'scan',
        'parse',
        'graph',
        'embedding',
        'git',
        'impact',
        'ai',
        'self_heal',
        'pr'
    ]
    
    all_ok = True
    for route in routes:
        try:
            exec(f"from app.routes import {route}")
            print(f"✓ {route}")
        except Exception as e:
            print(f"✗ {route}: {e}")
            all_ok = False
    
    return all_ok

def check_env():
    """Check if .env file exists and has required variables"""
    print("\n\nChecking environment configuration...")
    
    env_file = Path(__file__).parent / '.env'
    if not env_file.exists():
        print("⚠ .env file not found")
        return False
    
    required_vars = [
        'NEO4J_URI',
        'NEO4J_USER',
        'NEO4J_PASSWORD',
        'PINECONE_API_KEY',
        'GEMINI_API_KEY',
        'GROQ_API_KEY'
    ]
    
    with open(env_file, 'r') as f:
        content = f.read()
    
    all_ok = True
    for var in required_vars:
        if var in content and not content.split(var)[1].split('\n')[0].strip() == '=':
            print(f"✓ {var}")
        else:
            print(f"✗ {var} not set")
            all_ok = False
    
    return all_ok

def main():
    print("="*60)
    print("RepoGuardian AI - Quick Verification")
    print("="*60)
    
    results = {
        'imports': test_imports(),
        'services': test_services(),
        'routes': test_routes(),
        'env': check_env()
    }
    
    print("\n" + "="*60)
    print("SUMMARY")
    print("="*60)
    
    for test, passed in results.items():
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"{test.upper()}: {status}")
    
    if all(results.values()):
        print("\n✓ All checks passed! Server should start successfully.")
        print("\nTo start the server, run:")
        print("  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
    else:
        print("\n⚠ Some checks failed. Please fix the issues above.")
    
    print("="*60)

if __name__ == "__main__":
    main()

# Made with Bob

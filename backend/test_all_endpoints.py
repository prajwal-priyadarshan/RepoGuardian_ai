"""
Comprehensive endpoint testing script for RepoGuardian AI Backend
Tests all API endpoints to ensure they're working properly
"""

import requests
import json
import time
from pathlib import Path

BASE_URL = "http://localhost:8000"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_test(name, status, message=""):
    if status == "PASS":
        print(f"{Colors.GREEN}✓ {name}{Colors.END} {message}")
    elif status == "FAIL":
        print(f"{Colors.RED}✗ {name}{Colors.END} {message}")
    elif status == "SKIP":
        print(f"{Colors.YELLOW}⊘ {name}{Colors.END} {message}")
    else:
        print(f"{Colors.BLUE}→ {name}{Colors.END} {message}")

def test_health_endpoints():
    print(f"\n{Colors.BLUE}{'='*60}")
    print("Testing Health Endpoints")
    print(f"{'='*60}{Colors.END}\n")
    
    # Test root endpoint
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            print_test("GET /", "PASS", f"Status: {response.status_code}")
        else:
            print_test("GET /", "FAIL", f"Status: {response.status_code}")
    except Exception as e:
        print_test("GET /", "FAIL", f"Error: {str(e)}")
    
    # Test health endpoint
    try:
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            print_test("GET /health", "PASS", f"Status: {response.status_code}")
        else:
            print_test("GET /health", "FAIL", f"Status: {response.status_code}")
    except Exception as e:
        print_test("GET /health", "FAIL", f"Error: {str(e)}")

def test_repo_endpoints(test_repo_url="https://github.com/octocat/Hello-World.git"):
    print(f"\n{Colors.BLUE}{'='*60}")
    print("Testing Repository Endpoints")
    print(f"{'='*60}{Colors.END}\n")
    
    repo_id = None
    
    # Test clone endpoint
    try:
        print_test("POST /repo/clone", "INFO", "Cloning repository...")
        response = requests.post(
            f"{BASE_URL}/repo/clone",
            json={"repo_url": test_repo_url}
        )
        if response.status_code == 200:
            data = response.json()
            repo_id = data.get("repo_id")
            print_test("POST /repo/clone", "PASS", f"Repo ID: {repo_id}")
        else:
            print_test("POST /repo/clone", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        print_test("POST /repo/clone", "FAIL", f"Error: {str(e)}")
    
    # Test sync endpoint (if we have a repo_id)
    if repo_id:
        try:
            response = requests.post(f"{BASE_URL}/repo/sync/{repo_id}")
            if response.status_code == 200:
                print_test(f"POST /repo/sync/{repo_id}", "PASS", "Repository synced")
            else:
                print_test(f"POST /repo/sync/{repo_id}", "FAIL", f"Status: {response.status_code}")
        except Exception as e:
            print_test(f"POST /repo/sync/{repo_id}", "FAIL", f"Error: {str(e)}")
    
    return repo_id

def test_scan_endpoints(repo_id):
    print(f"\n{Colors.BLUE}{'='*60}")
    print("Testing Scan Endpoints")
    print(f"{'='*60}{Colors.END}\n")
    
    if not repo_id:
        print_test("Scan Tests", "SKIP", "No repo_id available")
        return
    
    try:
        response = requests.get(f"{BASE_URL}/scan/{repo_id}")
        if response.status_code == 200:
            data = response.json()
            file_count = len(data.get("files", []))
            print_test(f"GET /scan/{repo_id}", "PASS", f"Found {file_count} files")
        else:
            print_test(f"GET /scan/{repo_id}", "FAIL", f"Status: {response.status_code}")
    except Exception as e:
        print_test(f"GET /scan/{repo_id}", "FAIL", f"Error: {str(e)}")

def test_parse_endpoints(repo_id):
    print(f"\n{Colors.BLUE}{'='*60}")
    print("Testing Parse Endpoints")
    print(f"{'='*60}{Colors.END}\n")
    
    if not repo_id:
        print_test("Parse Tests", "SKIP", "No repo_id available")
        return
    
    try:
        response = requests.get(f"{BASE_URL}/parse/{repo_id}")
        if response.status_code == 200:
            data = response.json()
            parsed_count = len(data.get("parsed_data", []))
            print_test(f"GET /parse/{repo_id}", "PASS", f"Parsed {parsed_count} files")
        else:
            print_test(f"GET /parse/{repo_id}", "FAIL", f"Status: {response.status_code}")
    except Exception as e:
        print_test(f"GET /parse/{repo_id}", "FAIL", f"Error: {str(e)}")

def test_graph_endpoints(repo_id):
    print(f"\n{Colors.BLUE}{'='*60}")
    print("Testing Graph Endpoints")
    print(f"{'='*60}{Colors.END}\n")
    
    if not repo_id:
        print_test("Graph Tests", "SKIP", "No repo_id available")
        return
    
    # Test build graph
    try:
        print_test(f"POST /graph/build/{repo_id}", "INFO", "Building graph...")
        response = requests.post(f"{BASE_URL}/graph/build/{repo_id}")
        if response.status_code == 200:
            print_test(f"POST /graph/build/{repo_id}", "PASS", "Graph built successfully")
        else:
            print_test(f"POST /graph/build/{repo_id}", "FAIL", f"Status: {response.status_code}")
    except Exception as e:
        print_test(f"POST /graph/build/{repo_id}", "FAIL", f"Error: {str(e)}")

def test_embedding_endpoints(repo_id):
    print(f"\n{Colors.BLUE}{'='*60}")
    print("Testing Embedding Endpoints")
    print(f"{'='*60}{Colors.END}\n")
    
    if not repo_id:
        print_test("Embedding Tests", "SKIP", "No repo_id available")
        return
    
    # Test store embeddings
    try:
        print_test(f"POST /embeddings/store/{repo_id}", "INFO", "Storing embeddings...")
        response = requests.post(f"{BASE_URL}/embeddings/store/{repo_id}")
        if response.status_code == 200:
            print_test(f"POST /embeddings/store/{repo_id}", "PASS", "Embeddings stored")
        else:
            print_test(f"POST /embeddings/store/{repo_id}", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        print_test(f"POST /embeddings/store/{repo_id}", "FAIL", f"Error: {str(e)}")
    
    # Test query embeddings
    try:
        response = requests.post(
            f"{BASE_URL}/embeddings/query",
            json={"query": "main function", "repo_id": repo_id}
        )
        if response.status_code == 200:
            data = response.json()
            result_count = len(data.get("results", []))
            print_test("POST /embeddings/query", "PASS", f"Found {result_count} results")
        else:
            print_test("POST /embeddings/query", "FAIL", f"Status: {response.status_code}")
    except Exception as e:
        print_test("POST /embeddings/query", "FAIL", f"Error: {str(e)}")

def test_git_endpoints(repo_id):
    print(f"\n{Colors.BLUE}{'='*60}")
    print("Testing Git Endpoints")
    print(f"{'='*60}{Colors.END}\n")
    
    if not repo_id:
        print_test("Git Tests", "SKIP", "No repo_id available")
        return
    
    try:
        response = requests.post(f"{BASE_URL}/git/diff/{repo_id}")
        if response.status_code == 200:
            data = response.json()
            changed_count = len(data.get("changed_functions", []))
            print_test(f"POST /git/diff/{repo_id}", "PASS", f"Found {changed_count} changed functions")
        else:
            print_test(f"POST /git/diff/{repo_id}", "FAIL", f"Status: {response.status_code}")
    except Exception as e:
        print_test(f"POST /git/diff/{repo_id}", "FAIL", f"Error: {str(e)}")

def test_impact_endpoints(repo_id):
    print(f"\n{Colors.BLUE}{'='*60}")
    print("Testing Impact Analysis Endpoints")
    print(f"{'='*60}{Colors.END}\n")
    
    if not repo_id:
        print_test("Impact Tests", "SKIP", "No repo_id available")
        return
    
    try:
        print_test("POST /impact/analyze", "INFO", "Analyzing impact...")
        response = requests.post(
            f"{BASE_URL}/impact/analyze",
            json={"repo_id": repo_id}
        )
        if response.status_code == 200:
            data = response.json()
            impact_count = len(data.get("impact", []))
            print_test("POST /impact/analyze", "PASS", f"Found {impact_count} impacts")
        else:
            print_test("POST /impact/analyze", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        print_test("POST /impact/analyze", "FAIL", f"Error: {str(e)}")

def test_ai_endpoints(repo_id):
    print(f"\n{Colors.BLUE}{'='*60}")
    print("Testing AI Analysis Endpoints")
    print(f"{'='*60}{Colors.END}\n")
    
    if not repo_id:
        print_test("AI Tests", "SKIP", "No repo_id available")
        return
    
    # Test automatic AI analysis
    try:
        print_test("POST /ai/analyze", "INFO", "Running AI analysis...")
        response = requests.post(
            f"{BASE_URL}/ai/analyze",
            json={"repo_id": repo_id}
        )
        if response.status_code == 200:
            data = response.json()
            analysis_count = len(data.get("analyses", []))
            print_test("POST /ai/analyze", "PASS", f"Generated {analysis_count} analyses")
        else:
            print_test("POST /ai/analyze", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        print_test("POST /ai/analyze", "FAIL", f"Error: {str(e)}")

def test_self_heal_endpoints(repo_id):
    print(f"\n{Colors.BLUE}{'='*60}")
    print("Testing Self-Healing Endpoints")
    print(f"{'='*60}{Colors.END}\n")
    
    if not repo_id:
        print_test("Self-Heal Tests", "SKIP", "No repo_id available")
        return
    
    try:
        print_test("POST /self-heal/", "INFO", "Running self-healing...")
        response = requests.post(
            f"{BASE_URL}/self-heal/",
            json={"repo_id": repo_id}
        )
        if response.status_code == 200:
            data = response.json()
            print_test("POST /self-heal/", "PASS", f"Status: {data.get('status', 'unknown')}")
        else:
            print_test("POST /self-heal/", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        print_test("POST /self-heal/", "FAIL", f"Error: {str(e)}")

def test_pr_endpoints(repo_id):
    print(f"\n{Colors.BLUE}{'='*60}")
    print("Testing PR Generation Endpoints")
    print(f"{'='*60}{Colors.END}\n")
    
    if not repo_id:
        print_test("PR Tests", "SKIP", "No repo_id available")
        return
    
    # Test patch generation
    try:
        response = requests.post(
            f"{BASE_URL}/pr/patch",
            json={"repo_id": repo_id}
        )
        if response.status_code == 200:
            data = response.json()
            patch_type = data.get("patch", {}).get("type", "unknown")
            print_test("POST /pr/patch", "PASS", f"Patch type: {patch_type}")
        else:
            print_test("POST /pr/patch", "FAIL", f"Status: {response.status_code}")
    except Exception as e:
        print_test("POST /pr/patch", "FAIL", f"Error: {str(e)}")
    
    # Test PR summary generation
    try:
        print_test("POST /pr/summary", "INFO", "Generating PR summary...")
        response = requests.post(
            f"{BASE_URL}/pr/summary",
            json={"repo_id": repo_id}
        )
        if response.status_code == 200:
            data = response.json()
            risk_level = data.get("summary", {}).get("risk_level", "unknown")
            print_test("POST /pr/summary", "PASS", f"Risk level: {risk_level}")
        else:
            print_test("POST /pr/summary", "FAIL", f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        print_test("POST /pr/summary", "FAIL", f"Error: {str(e)}")
    
    # Test PR risk analysis
    try:
        response = requests.post(
            f"{BASE_URL}/pr/risk-analysis",
            json={"repo_id": repo_id}
        )
        if response.status_code == 200:
            data = response.json()
            assessment = data.get("risk_analysis", {}).get("assessment", "unknown")
            print_test("POST /pr/risk-analysis", "PASS", f"Assessment: {assessment}")
        else:
            print_test("POST /pr/risk-analysis", "FAIL", f"Status: {response.status_code}")
    except Exception as e:
        print_test("POST /pr/risk-analysis", "FAIL", f"Error: {str(e)}")

def main():
    print(f"\n{Colors.BLUE}{'='*60}")
    print("RepoGuardian AI - Comprehensive Endpoint Testing")
    print(f"{'='*60}{Colors.END}\n")
    print(f"Base URL: {BASE_URL}\n")
    
    # Check if server is running
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        print(f"{Colors.GREEN}✓ Server is running{Colors.END}\n")
    except Exception as e:
        print(f"{Colors.RED}✗ Server is not running. Please start the server first.{Colors.END}")
        print(f"Error: {str(e)}\n")
        return
    
    # Run all tests
    test_health_endpoints()
    
    # Test with a small public repo
    repo_id = test_repo_endpoints()
    
    if repo_id:
        # Wait a bit for processing
        print(f"\n{Colors.YELLOW}Waiting 5 seconds for background processing...{Colors.END}")
        time.sleep(5)
        
        test_scan_endpoints(repo_id)
        test_parse_endpoints(repo_id)
        test_graph_endpoints(repo_id)
        test_embedding_endpoints(repo_id)
        test_git_endpoints(repo_id)
        test_impact_endpoints(repo_id)
        test_ai_endpoints(repo_id)
        test_self_heal_endpoints(repo_id)
        test_pr_endpoints(repo_id)
    
    print(f"\n{Colors.BLUE}{'='*60}")
    print("Testing Complete!")
    print(f"{'='*60}{Colors.END}\n")

if __name__ == "__main__":
    main()

# Made with Bob

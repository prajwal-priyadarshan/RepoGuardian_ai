import requests

url = 'http://127.0.0.1:8000/ai/analyze/dev'

# Replace with a repo_id returned from dev-upload. Using last known sample ID from test run.
repo_id = '3426b152-058a-4ac0-a11d-44646355ce2e'

try:
    r = requests.post(url, json={'repo_id': repo_id}, timeout=60)
    print('STATUS', r.status_code)
    print(r.json())
except Exception as e:
    print('ERROR', e)

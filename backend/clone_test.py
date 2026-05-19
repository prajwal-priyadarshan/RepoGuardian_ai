import requests

url = 'http://127.0.0.1:8000/repo/dev-clone'
repo = {'repo_url': 'https://github.com/prajwal-priyadarshan/simple_app'}

try:
    r = requests.post(url, json=repo, timeout=120)
    print('STATUS', r.status_code)
    print(r.json())
except Exception as e:
    print('ERROR', e)

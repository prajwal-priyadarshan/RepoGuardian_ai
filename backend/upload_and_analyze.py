import zipfile
import os
import requests
import uuid

BASE = os.path.dirname(__file__) or '.'
zip_path = os.path.join(BASE, 'test_code_upload.zip')

# create a small python repo zip
with zipfile.ZipFile(zip_path, 'w') as z:
    z.writestr('sample.py', 'def add(a, b):\n    return a + b\n')

# Upload
upload_url = 'http://127.0.0.1:8000/repo/dev-upload'
files = {'file': open(zip_path, 'rb')}
params = {'user_id': str(uuid.uuid4())}

r = requests.post(upload_url, files=files, params=params, timeout=60)
print('UPLOAD', r.status_code, r.text)

if r.status_code == 200:
    repo_id = r.json().get('repo_id')
    analyze_url = 'http://127.0.0.1:8000/ai/analyze/dev'
    resp = requests.post(analyze_url, json={'repo_id': repo_id}, timeout=60)
    print('ANALYZE', resp.status_code)
    print(resp.json())
else:
    print('Upload failed')

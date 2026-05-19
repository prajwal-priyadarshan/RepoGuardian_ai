import zipfile
import os
import requests
import uuid

BASE = os.path.dirname(__file__) or '.'
zip_path = os.path.join(BASE, 'test_upload.zip')

# create a small zip
with zipfile.ZipFile(zip_path, 'w') as z:
    z.writestr('hello.txt', 'Hello RepoGuardian!')

url = 'http://127.0.0.1:8000/repo/dev-upload'
files = {'file': open(zip_path, 'rb')}
params = {'user_id': str(uuid.uuid4())}

try:
    r = requests.post(url, files=files, params=params, timeout=60)
    print('STATUS', r.status_code)
    print(r.text)
except Exception as e:
    print('ERROR', e)

import os
from neo4j import GraphDatabase
from dotenv import load_dotenv

load_dotenv(override=True)
uri = os.getenv("NEO4J_URI")
user = os.getenv("NEO4J_USER")
password = os.getenv("NEO4J_PASSWORD")

print(f"Connecting to: {uri} with user: {user}")
try:
    driver = GraphDatabase.driver(uri, auth=(user, password))
    driver.verify_connectivity()
    print("Connected successfully!")
except Exception as e:
    import traceback
    traceback.print_exc()
finally:
    if 'driver' in locals() and driver:
        driver.close()

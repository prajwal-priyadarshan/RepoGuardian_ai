import os

# Bypass the buggy python-dotenv library completely and read the file manually
env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
try:
    with open(env_path, "r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, val = line.split("=", 1)
                os.environ[key.strip()] = val.strip()
except Exception as e:
    print(f"Failed to read .env manually: {e}")

# Imports
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from pinecone import Pinecone
from langchain_openai import ChatOpenAI

# Debug: Check if Python actually sees the keys
print(f"DEBUG - Found GEMINI Key: {'YES' if os.getenv('GEMINI_API_KEY') else 'NO'}")
print(f"DEBUG - Found GROQ Key: {'YES' if os.getenv('GROQ_API_KEY') else 'NO'}")

def test_gemini():
    print("\n--- Testing Google Gemini Embeddings ---")
    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key:
        print("❌ GEMINI_API_KEY not found in .env")
        return
        
    print("Querying Google directly to see exactly which models your API key has access to...")
    import requests
    url = f"https://generativelanguage.googleapis.com/v1beta/models?key={gemini_key}"
    response = requests.get(url)
    
    if response.status_code != 200:
        print(f"❌ Failed to contact Google API: {response.text}")
        return
        
    models = response.json().get('models', [])
    embed_models = [m['name'] for m in models if 'embedContent' in m.get('supportedGenerationMethods', [])]
    
    print(f"✅ Your key has access to these embedding models: {embed_models}")
    
    if not embed_models:
        print("❌ Critical Error: Your API key has zero embedding models assigned to it!")
        return
        
    # Try the first valid model we found
    best_model = embed_models[0]
    print(f"Trying to embed with {best_model} via LangChain...")
    
    try:
        embeddings = GoogleGenerativeAIEmbeddings(
            model=best_model,
            google_api_key=gemini_key
        )
        res = embeddings.embed_query("Hello world")
        print(f"✅ SUCCESS! Vector length: {len(res)}")
        print(f"\n👉 Next Step: Update embedding_service.py to use: model=\"{best_model}\"")
    except Exception as e:
        print(f"❌ LangChain Failed to use {best_model}: {e}")

def test_pinecone():
    print("\n--- Testing Pinecone ---")
    pinecone_key = os.getenv("PINECONE_API_KEY")
    if not pinecone_key:
        print("❌ PINECONE_API_KEY not found in .env")
        return
        
    try:
        pc = Pinecone(api_key=pinecone_key)
        indexes = pc.list_indexes()
        index_names = [i['name'] for i in indexes]
        print(f"✅ Success! Connected to Pinecone. Existing indexes: {index_names}")
    except Exception as e:
        print(f"❌ Pinecone Error: {e}")

def test_groq():
    print("\n--- Testing Groq LLM ---")
    groq_key = os.getenv("GROQ_API_KEY")
    if not groq_key:
        print("❌ GROQ_API_KEY not found in .env")
        return
        
    try:
        llm = ChatOpenAI(
            base_url="https://api.groq.com/openai/v1",
            model="llama-3.3-70b-versatile", 
            api_key=groq_key,
            max_tokens=20
        )
        res = llm.invoke("Say the exact word 'Banana'")
        print(f"✅ Success! Groq responded with: {res.content}")
    except Exception as e:
        print(f"❌ Groq Error: {e}")

if __name__ == "__main__":
    print("Starting API Connection Tests...")
    test_gemini()
    test_pinecone()
    test_groq()
    print("\nTests finished!")

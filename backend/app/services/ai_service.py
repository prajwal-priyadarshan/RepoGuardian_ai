import os
import json
from dotenv import load_dotenv
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field

load_dotenv(override=True)

class CodeAnalysisResult(BaseModel):
    explanation: str = Field(description="Explain what impact this change has")
    risks: list[str] = Field(description="Identify potential bugs or failures")
    why_breaks: str = Field(description="Explain WHY it breaks")
    suggestions: list[str] = Field(description="Suggest fixes")
    fixed_code: str = Field(description="Provide corrected code safely rewritten")

def get_llm():
    api_key = os.getenv("DEEPSEEK_API_KEY")
    if not api_key:
        raise ValueError("DEEPSEEK_API_KEY is missing. Please set it in your .env file.")
        
    # We use LangChain's OpenAI wrapper but point it directly to DeepSeek's API
    return ChatOpenAI(
        base_url="https://api.deepseek.com",
        model="deepseek-chat", 
        temperature=0.2,
        api_key=api_key
    )

def analyze_code_change(data: dict) -> dict:
    llm = get_llm()
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are a senior software engineer analyzing code changes in a large codebase.

Your job is to:
1. Explain what impact this change has
2. Identify potential bugs or failures
3. Explain WHY it breaks
4. Suggest fixes
5. Provide corrected code"""),
        ("user", """Please analyze the following code change context:

Changed Function: {function}
Changed Code:
{changed_code}

Dependency Chain (Files that rely on this):
{dependencies}

Retrieved Semantic Context (Pinecone):
{context}

Static Issues:
{issues}""")
    ])
    
    # Enforce strict deterministic JSON output
    structured_llm = llm.with_structured_output(CodeAnalysisResult)
    chain = prompt | structured_llm
    
    function_name = data.get("function", "Unknown")
    changed_code = data.get("changed_code", "")
    dependencies = json.dumps(data.get("dependencies", []), indent=2)
    context = json.dumps(data.get("context", []), indent=2)
    issues = json.dumps(data.get("issues", []), indent=2)
    
    result = chain.invoke({
        "function": function_name,
        "changed_code": changed_code,
        "dependencies": dependencies,
        "context": context,
        "issues": issues
    })
    
    return result.model_dump()

def generate_fix_code(data: dict) -> str:
    llm = get_llm()
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert coder. Rewrite the function safely to fix issues and ensure compatibility with its dependencies. Return ONLY the code."),
        ("user", "Function: {function}\nCode:\n{changed_code}\nDependencies:\n{dependencies}")
    ])
    
    chain = prompt | llm
    
    res = chain.invoke({
        "function": data.get("function", ""),
        "changed_code": data.get("changed_code", ""),
        "dependencies": json.dumps(data.get("dependencies", []))
    })
    
    return res.content

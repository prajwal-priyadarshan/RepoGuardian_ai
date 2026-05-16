import os
from pathlib import Path
from typing import List, Dict
from app.services import file_scanner

import tree_sitter
from tree_sitter import Language, Parser

# Import the language bindings
import tree_sitter_python
import tree_sitter_javascript
import tree_sitter_typescript
import tree_sitter_java
import tree_sitter_cpp
import tree_sitter_c

BASE_DATA_DIR = Path("data/repos")

# Load languages dynamically
LANGUAGES = {
    ".py": Language(tree_sitter_python.language()),
    ".js": Language(tree_sitter_javascript.language()),
    ".jsx": Language(tree_sitter_javascript.language()),
    ".ts": Language(tree_sitter_typescript.language_typescript()),
    ".tsx": Language(tree_sitter_typescript.language_tsx()),
    ".java": Language(tree_sitter_java.language()),
    ".cpp": Language(tree_sitter_cpp.language()),
    ".c": Language(tree_sitter_c.language())
}

# Define grammar mappings for different languages to map AST nodes correctly
GRAMMAR_MAPPINGS = {
    "function": {
        "function_definition", "function_declaration", "method_declaration", 
        "method_definition", "arrow_function", "function_item"
    },
    "class": {
        "class_definition", "class_declaration", "class_specifier", "struct_specifier"
    },
    "import": {
        "import_statement", "import_from_statement", "import_declaration", "preproc_include"
    }
}

def extract_name(node, source_bytes):
    """Helper to safely extract the name of a function or class node."""
    
    # Arrow functions usually don't have a name themselves, their parent 'variable_declarator' does
    if node.type == "arrow_function" and node.parent and node.parent.type == "variable_declarator":
        name_node = node.parent.child_by_field_name("name")
        if name_node:
            return source_bytes[name_node.start_byte:name_node.end_byte].decode('utf-8')

    # Common standard 'name' field
    if node.child_by_field_name("name"):
        name_node = node.child_by_field_name("name")
        return source_bytes[name_node.start_byte:name_node.end_byte].decode('utf-8')
    
    # C/C++ often use 'declarator' 
    elif node.child_by_field_name("declarator"):
        decl = node.child_by_field_name("declarator")
        # Handle nested declarators in C++
        if decl.child_by_field_name("declarator"):
            decl = decl.child_by_field_name("declarator")
        return source_bytes[decl.start_byte:decl.end_byte].decode('utf-8')
    
    # Fallback to the first 'identifier' found in children
    for child in node.children:
        if child.type == "identifier":
            return source_bytes[child.start_byte:child.end_byte].decode('utf-8')
            
    return "Unknown"

def parse_file(file_path: str) -> dict:
    """Parses a file using Tree-sitter and extracts functions, classes, and imports."""
    result = {
        "file": Path(file_path).name,
        "functions": [],
        "classes": [],
        "imports": []
    }
    
    _, ext = os.path.splitext(file_path)
    if ext not in LANGUAGES:
        return result

    try:
        with open(file_path, "r", encoding="utf-8") as f:
            source_code = f.read()
            
        source_bytes = source_code.encode("utf-8")
        
        parser = Parser(LANGUAGES[ext])
        tree = parser.parse(source_bytes)
        
        # Simple recursive tree traversal to capture structural elements
        def traverse(node):
            if node.type in GRAMMAR_MAPPINGS["function"]:
                name = extract_name(node, source_bytes)
                if name != "Unknown":
                    result["functions"].append({"name": name, "args": []}) 
                    
            elif node.type in GRAMMAR_MAPPINGS["class"]:
                name = extract_name(node, source_bytes)
                if name != "Unknown":
                    result["classes"].append({"name": name, "methods": []})
                    
            elif node.type in GRAMMAR_MAPPINGS["import"]:
                # Grab the raw import text line
                source_text = source_bytes[node.start_byte:node.end_byte].decode('utf-8').strip()
                result["imports"].append(source_text)
                
            elif node.type == "call_expression":
                function_node = node.child_by_field_name("function")
                if function_node and source_bytes[function_node.start_byte:function_node.end_byte].decode('utf-8') == "require":
                    stmt = node
                    while stmt and stmt.type not in ["variable_declaration", "lexical_declaration", "expression_statement"]:
                        stmt = stmt.parent
                    if stmt:
                        source_text = source_bytes[stmt.start_byte:stmt.end_byte].decode('utf-8').strip()
                        if source_text not in result["imports"]:
                            result["imports"].append(source_text)
                
            # Continue traversal
            for child in node.children:
                traverse(child)
                
        traverse(tree.root_node)
                    
    except Exception as e:
        import traceback
        traceback.print_exc()
        pass
        
    return result

def parse_repository(repo_id: str) -> List[dict]:
    """Scans and parses all supported files in a repository."""
    repo_path = BASE_DATA_DIR / repo_id
    if not repo_path.exists() or not repo_path.is_dir():
        raise FileNotFoundError(f"Repository {repo_id} not found.")
        
    scanned_files = file_scanner.scan_repository(repo_id)
    parsed_data = []
    
    for rel_path in scanned_files:
        _, ext = os.path.splitext(rel_path)
        # Parse if the extension is supported by our Tree-sitter languages
        if ext in LANGUAGES:
            full_path = str(repo_path / rel_path)
            parsed_info = parse_file(full_path)
            # Override filename with relative path from the root
            parsed_info["file"] = rel_path
            parsed_data.append(parsed_info)
            
    return parsed_data

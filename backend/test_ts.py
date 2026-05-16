import tree_sitter
from tree_sitter import Language, Parser
import tree_sitter_javascript
from pathlib import Path

parser = Parser()
parser.set_language(Language(tree_sitter_javascript.language()))

file_path = Path("data/repos/eee4f425-a756-4751-acc8-04628c039113/Frontend/src/App.jsx")
with open(file_path, "r", encoding="utf-8") as f:
    source_bytes = f.read().encode("utf-8")

tree = parser.parse(source_bytes)

def traverse(node, depth=0):
    print("  " * depth + node.type)
    for child in node.children:
        traverse(child, depth + 1)

print("--- APP.JSX NODES ---")
traverse(tree.root_node)

file_path2 = Path("data/repos/eee4f425-a756-4751-acc8-04628c039113/Backend/server.js")
with open(file_path2, "r", encoding="utf-8") as f:
    source_bytes2 = f.read().encode("utf-8")

tree2 = parser.parse(source_bytes2)
print("--- SERVER.JS NODES ---")
traverse(tree2.root_node)

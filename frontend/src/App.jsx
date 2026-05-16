function App() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">
          RepoGuardian AI Dashboard
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Your production-grade AI system for clean, scalable, and secure code.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
            <h3 className="font-semibold text-gray-800">AST Parser</h3>
            <p className="text-sm text-gray-500 mt-1">Tree-sitter analysis</p>
          </div>
          <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
            <h3 className="font-semibold text-gray-800">Graph DB</h3>
            <p className="text-sm text-gray-500 mt-1">Neo4j relationships</p>
          </div>
          <div className="p-4 border border-gray-100 rounded-lg bg-gray-50">
            <h3 className="font-semibold text-gray-800">Vector Search</h3>
            <p className="text-sm text-gray-500 mt-1">ChromaDB embeddings</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, FileCode, Hash, TrendingUp } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
  LoadingSpinner,
} from '../components/ui';
import { useAppStore, selectCurrentRepo } from '../store/useAppStore';
import { useSearchCode } from '../hooks/useAPI';

export const CodeSearch = () => {
  const { repositories, searchResults, isLoading } = useAppStore();
  const currentRepo = useAppStore(selectCurrentRepo);
  const [selectedRepoId, setSelectedRepoId] = useState(currentRepo?.id || repositories[0]?.id || '');
  const [query, setQuery] = useState('');

  const searchMutation = useSearchCode();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRepoId || !query.trim()) return;
    await searchMutation.mutateAsync({
      query: query.trim(),
      repo_id: selectedRepoId,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Code Search</h1>
          <p className="text-gray-600 mt-1">
            Search your codebase using natural language with Pinecone vector search
          </p>
        </div>
      </div>

      {/* Search Interface */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Semantic Code Search</CardTitle>
          <CardDescription>
            Ask questions in natural language to find relevant code
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <select
              value={selectedRepoId}
              onChange={(e) => setSelectedRepoId(e.target.value)}
              className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a repository...</option>
              {repositories.map((repo) => (
                <option key={repo.id} value={repo.id}>
                  {repo.name}
                </option>
              ))}
            </select>

            <div className="flex gap-3">
              <Input
                placeholder="e.g., How does authentication work? or Find database connection logic"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1"
              />
              <Button
                type="submit"
                isLoading={searchMutation.isPending}
                disabled={!selectedRepoId || !query.trim()}
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <TrendingUp className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-purple-800">
                  <p className="font-semibold mb-1">Example Queries:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>How does the authentication system work?</li>
                    <li>Find all database connection logic</li>
                    <li>Show me error handling code</li>
                    <li>Where is the API endpoint for user registration?</li>
                  </ul>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Search Results */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : searchResults && searchResults.results ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">
              Search Results ({searchResults.results.length})
            </h3>
            <span className="text-sm text-gray-600">
              Powered by Gemini embeddings & Pinecone
            </span>
          </div>

          {searchResults.results.length > 0 ? (
            searchResults.results.map((result, index) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card variant="elevated">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <FileCode className="w-5 h-5 text-blue-600" />
                          <CardTitle className="text-lg font-mono">
                            {result.metadata.function_name}
                          </CardTitle>
                        </div>
                        <CardDescription className="font-mono text-xs">
                          {result.metadata.file_path}
                          {result.metadata.line_start && result.metadata.line_end && (
                            <span className="ml-2 text-gray-500">
                              (Lines {result.metadata.line_start}-{result.metadata.line_end})
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Hash className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-600">
                          {(result.score * 100).toFixed(1)}% match
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* Relevance Score Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
                          style={{ width: `${result.score * 100}%` }}
                        />
                      </div>

                      {/* Code Preview */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">
                          Code Preview
                        </h4>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{result.metadata.code}</code>
                        </pre>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <Card variant="elevated">
              <CardContent className="text-center py-8">
                <p className="text-gray-600">No results found for your query</p>
                <p className="text-sm text-gray-500 mt-1">
                  Try rephrasing your question or using different keywords
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card variant="elevated">
          <CardContent className="text-center py-12">
            <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Search Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Enter a natural language query to search your codebase
            </p>
            <div className="max-w-md mx-auto text-left bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-semibold text-gray-900 mb-2">
                💡 Tips for better results:
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Be specific about what you're looking for</li>
                <li>• Use technical terms when relevant</li>
                <li>• Ask about functionality, not file names</li>
                <li>• Try different phrasings if needed</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Made with Bob

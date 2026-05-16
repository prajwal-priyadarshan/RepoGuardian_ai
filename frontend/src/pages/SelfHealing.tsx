import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wrench, CheckCircle, XCircle, AlertTriangle, Code, GitCommit } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  LoadingSpinner,
} from '../components/ui';
import { useAppStore, selectCurrentRepo } from '../store/useAppStore';
import { useSelfHeal } from '../hooks/useAPI';

export const SelfHealing = () => {
  const { repositories, selfHealResults, isLoading } = useAppStore();
  const currentRepo = useAppStore(selectCurrentRepo);
  const [selectedRepoId, setSelectedRepoId] = useState(currentRepo?.id || repositories[0]?.id || '');

  const selfHealMutation = useSelfHeal();

  const handleSelfHeal = async () => {
    if (!selectedRepoId) return;
    await selfHealMutation.mutateAsync({ repo_id: selectedRepoId });
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
      case 'applied':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
      case 'applied':
        return 'bg-green-100 text-green-800';
      case 'failed':
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-orange-100 text-orange-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Self-Healing</h1>
          <p className="text-gray-600 mt-1">
            Automatically generate, validate, and apply code fixes
          </p>
        </div>
      </div>

      {/* Repository Selection */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Select Repository</CardTitle>
          <CardDescription>
            Choose a repository to trigger autonomous self-healing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4">
              <select
                value={selectedRepoId}
                onChange={(e) => setSelectedRepoId(e.target.value)}
                className="flex-1 h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a repository...</option>
                {repositories.map((repo) => (
                  <option key={repo.id} value={repo.id}>
                    {repo.name}
                  </option>
                ))}
              </select>
              <Button
                onClick={handleSelfHeal}
                isLoading={selfHealMutation.isPending}
                disabled={!selectedRepoId}
              >
                <Wrench className="w-4 h-4 mr-2" />
                Trigger Self-Healing
              </Button>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">How Self-Healing Works:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Detects changes in your latest commit</li>
                    <li>Analyzes impact using Neo4j dependency graphs</li>
                    <li>Generates fixes using Groq Llama 3.3 AI</li>
                    <li>Validates syntax and compatibility</li>
                    <li>Commits fixes back to your repository</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Self-Healing Results */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : selfHealResults ? (
        <div className="space-y-6">
          {/* Summary */}
          {selfHealResults.message && (
            <Card variant="bordered">
              <CardContent className="py-4">
                <p className="text-gray-600">{selfHealResults.message}</p>
              </CardContent>
            </Card>
          )}

          {/* Healing Results */}
          {selfHealResults.summary && selfHealResults.summary.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Healing Results ({selfHealResults.summary.length})
              </h3>
              {selfHealResults.summary.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card variant="elevated">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(result.result.status)}
                          <div>
                            <CardTitle className="text-lg">{result.entity}</CardTitle>
                            <CardDescription className="font-mono text-xs">
                              {result.file}
                            </CardDescription>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(result.result.status)}`}>
                          {result.result.status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Message */}
                      <div>
                        <p className="text-gray-700">{result.result.message}</p>
                      </div>

                      {/* Commit SHA */}
                      {result.result.commit_sha && (
                        <div className="flex items-center space-x-2 p-3 bg-green-50 rounded-lg">
                          <GitCommit className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-700">
                            Commit SHA:{' '}
                            <code className="font-mono text-green-700">
                              {result.result.commit_sha}
                            </code>
                          </span>
                        </div>
                      )}

                      {/* Validation Results */}
                      {result.result.validation && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                            <Code className="w-4 h-4 mr-2 text-purple-600" />
                            Validation Results
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2 p-3 bg-purple-50 rounded-lg">
                              {result.result.validation.syntax_valid ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                              <span className="text-sm text-gray-700">
                                Syntax: {result.result.validation.syntax_valid ? 'Valid' : 'Invalid'}
                              </span>
                            </div>
                            {result.result.validation.errors && result.result.validation.errors.length > 0 && (
                              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-sm font-semibold text-red-800 mb-2">Errors:</p>
                                <ul className="space-y-1">
                                  {result.result.validation.errors.map((error, i) => (
                                    <li key={i} className="text-sm text-red-700 flex items-start space-x-2">
                                      <span>•</span>
                                      <span>{error}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card variant="elevated">
              <CardContent className="text-center py-8">
                <p className="text-gray-600">No healing actions were performed</p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card variant="elevated">
          <CardContent className="text-center py-12">
            <Wrench className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Self-Healing Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Select a repository and trigger self-healing to automatically fix code issues
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Made with Bob

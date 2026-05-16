import { useState } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, FileCode, AlertCircle, TrendingUp } from 'lucide-react';
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
import { useImpactAnalysis } from '../hooks/useAPI';

export const ImpactAnalysis = () => {
  const { repositories, impactAnalysis, isLoading } = useAppStore();
  const currentRepo = useAppStore(selectCurrentRepo);
  const [selectedRepoId, setSelectedRepoId] = useState(currentRepo?.id || repositories[0]?.id || '');

  const impactMutation = useImpactAnalysis();

  const handleAnalyze = async () => {
    if (!selectedRepoId) return;
    await impactMutation.mutateAsync({ repo_id: selectedRepoId });
  };

  const getRiskColor = (score?: number) => {
    if (!score) return 'text-gray-600';
    if (score >= 7) return 'text-red-600';
    if (score >= 4) return 'text-orange-600';
    return 'text-green-600';
  };

  const getRiskBgColor = (score?: number) => {
    if (!score) return 'bg-gray-100';
    if (score >= 7) return 'bg-red-100';
    if (score >= 4) return 'bg-orange-100';
    return 'bg-green-100';
  };

  const getRiskLabel = (score?: number) => {
    if (!score) return 'Unknown';
    if (score >= 7) return 'High Risk';
    if (score >= 4) return 'Medium Risk';
    return 'Low Risk';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Impact Analysis</h1>
          <p className="text-gray-600 mt-1">
            Analyze the impact of code changes using Neo4j dependency graphs
          </p>
        </div>
      </div>

      {/* Repository Selection */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Select Repository</CardTitle>
          <CardDescription>Choose a repository to analyze impact</CardDescription>
        </CardHeader>
        <CardContent>
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
              onClick={handleAnalyze}
              isLoading={impactMutation.isPending}
              disabled={!selectedRepoId}
            >
              <GitBranch className="w-4 h-4 mr-2" />
              Analyze Impact
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Impact Results */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : impactAnalysis ? (
        <div className="space-y-6">
          {/* Overall Risk Score */}
          {impactAnalysis.risk_score !== undefined && (
            <Card variant="elevated">
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      Overall Risk Score
                    </h3>
                    <p className="text-sm text-gray-600">
                      Based on dependency analysis and change complexity
                    </p>
                  </div>
                  <div className={`text-center px-6 py-4 rounded-lg ${getRiskBgColor(impactAnalysis.risk_score)}`}>
                    <div className={`text-4xl font-bold ${getRiskColor(impactAnalysis.risk_score)}`}>
                      {impactAnalysis.risk_score.toFixed(1)}
                    </div>
                    <div className={`text-sm font-medium ${getRiskColor(impactAnalysis.risk_score)}`}>
                      {getRiskLabel(impactAnalysis.risk_score)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Changed Functions */}
          {impactAnalysis.changed_functions && (
            <Card variant="elevated">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileCode className="w-5 h-5 text-blue-600" />
                  <span>Changed Functions</span>
                </CardTitle>
                <CardDescription>
                  Functions modified in the latest commit
                </CardDescription>
              </CardHeader>
              <CardContent>
                {impactAnalysis.changed_functions.functions && impactAnalysis.changed_functions.functions.length > 0 ? (
                  <div className="space-y-2">
                    {impactAnalysis.changed_functions.functions.map((func, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg"
                      >
                        <FileCode className="w-4 h-4 text-blue-600" />
                        <span className="font-mono text-sm text-gray-900">{func}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">No function changes detected</p>
                )}

                {impactAnalysis.changed_functions.raw_diff && (
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Git Diff</h4>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-xs">
                      <code>{impactAnalysis.changed_functions.raw_diff}</code>
                    </pre>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Impact Details */}
          {impactAnalysis.impact && impactAnalysis.impact.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Dependency Impact Analysis
              </h3>
              {impactAnalysis.impact.map((impact, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card variant="elevated">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="flex items-center space-x-2">
                          <GitBranch className="w-5 h-5 text-green-600" />
                          <span className="font-mono">{impact.function}</span>
                        </CardTitle>
                        {impact.risk_score !== undefined && (
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskBgColor(impact.risk_score)} ${getRiskColor(impact.risk_score)}`}>
                            Risk: {impact.risk_score.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Affected Files */}
                      {impact.affected_files && impact.affected_files.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                            <AlertCircle className="w-4 h-4 mr-2 text-orange-600" />
                            Affected Files ({impact.affected_files.length})
                          </h4>
                          <div className="space-y-1">
                            {impact.affected_files.map((file, i) => (
                              <div
                                key={i}
                                className="flex items-center space-x-2 p-2 bg-orange-50 rounded text-sm"
                              >
                                <FileCode className="w-3 h-3 text-orange-600 flex-shrink-0" />
                                <span className="font-mono text-gray-900 truncate">{file}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Semantic Context */}
                      {impact.semantic_context && impact.semantic_context.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                            <TrendingUp className="w-4 h-4 mr-2 text-purple-600" />
                            Semantic Context
                          </h4>
                          <div className="space-y-2">
                            {impact.semantic_context.map((context, i) => (
                              <div
                                key={i}
                                className="p-3 bg-purple-50 rounded-lg text-sm text-gray-700"
                              >
                                {context}
                              </div>
                            ))}
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
                <p className="text-gray-600">No impact detected for this change</p>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <Card variant="elevated">
          <CardContent className="text-center py-12">
            <GitBranch className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Analysis Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Select a repository and run an impact analysis to see dependency graphs
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Made with Bob

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, AlertTriangle, CheckCircle, Code, Lightbulb } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  LoadingSpinner,
  Input,
  Modal,
} from '../components/ui';
import { useAppStore, selectCurrentRepo } from '../store/useAppStore';
import { useAIAnalysis, useAIManualAnalysis } from '../hooks/useAPI';

export const AIAnalysis = () => {
  const { repositories, aiAnalysis, isLoading } = useAppStore();
  const currentRepo = useAppStore(selectCurrentRepo);
  const [selectedRepoId, setSelectedRepoId] = useState(currentRepo?.id || '');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualData, setManualData] = useState({
    filePath: '',
    function: '',
    newCode: '',
  });

  const aiAnalysisMutation = useAIAnalysis();
  const manualAnalysisMutation = useAIManualAnalysis();

  const handleAutoAnalysis = async () => {
    if (!selectedRepoId) return;
    await aiAnalysisMutation.mutateAsync({ repo_id: selectedRepoId });
  };

  const handleManualAnalysis = async () => {
    if (!selectedRepoId || !manualData.filePath || !manualData.function || !manualData.newCode) return;
    await manualAnalysisMutation.mutateAsync({
      repo_id: selectedRepoId,
      file_path: manualData.filePath,
      function: manualData.function,
      new_code: manualData.newCode,
    });
    setIsManualModalOpen(false);
    setManualData({ filePath: '', function: '', newCode: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Analysis</h1>
          <p className="text-gray-600 mt-1">
            Analyze code changes with AI-powered insights from Groq Llama 3.3
          </p>
        </div>
      </div>

      {/* Repository Selection & Actions */}
      <Card variant="elevated">
        <CardHeader>
          <CardTitle>Select Repository</CardTitle>
          <CardDescription>Choose a repository to analyze</CardDescription>
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
                onClick={handleAutoAnalysis}
                isLoading={aiAnalysisMutation.isPending}
                disabled={!selectedRepoId}
              >
                <Brain className="w-4 h-4 mr-2" />
                Auto-Analyze Latest Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsManualModalOpen(true)}
                disabled={!selectedRepoId}
              >
                <Code className="w-4 h-4 mr-2" />
                Manual Analysis
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : aiAnalysis ? (
        <div className="space-y-6">
          {aiAnalysis.message && (
            <Card variant="bordered">
              <CardContent className="py-4">
                <p className="text-gray-600">{aiAnalysis.message}</p>
              </CardContent>
            </Card>
          )}

          {aiAnalysis.analyses && aiAnalysis.analyses.length > 0 ? (
            aiAnalysis.analyses.map((analysis, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card variant="elevated">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          <Code className="w-5 h-5 text-purple-600" />
                          <span>{analysis.function}</span>
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Explanation */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                        <Brain className="w-4 h-4 mr-2 text-blue-600" />
                        Impact Explanation
                      </h4>
                      <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">
                        {analysis.explanation}
                      </p>
                    </div>

                    {/* Risks */}
                    {analysis.risks && analysis.risks.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-2 text-red-600" />
                          Potential Risks
                        </h4>
                        <ul className="space-y-2">
                          {analysis.risks.map((risk, i) => (
                            <li key={i} className="flex items-start space-x-2 text-gray-700 bg-red-50 p-3 rounded-lg">
                              <span className="text-red-600 font-bold">•</span>
                              <span>{risk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Why it Breaks */}
                    {analysis.why_breaks && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-2 text-orange-600" />
                          Why It Breaks
                        </h4>
                        <p className="text-gray-700 bg-orange-50 p-3 rounded-lg">
                          {analysis.why_breaks}
                        </p>
                      </div>
                    )}

                    {/* Suggestions */}
                    {analysis.suggestions && analysis.suggestions.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <Lightbulb className="w-4 h-4 mr-2 text-yellow-600" />
                          Suggestions
                        </h4>
                        <ul className="space-y-2">
                          {analysis.suggestions.map((suggestion, i) => (
                            <li key={i} className="flex items-start space-x-2 text-gray-700 bg-yellow-50 p-3 rounded-lg">
                              <CheckCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Fixed Code */}
                    {analysis.fixed_code && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                          Suggested Fix
                        </h4>
                        <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                          <code>{analysis.fixed_code}</code>
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : null}
        </div>
      ) : (
        <Card variant="elevated">
          <CardContent className="text-center py-12">
            <Brain className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Analysis Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Select a repository and run an analysis to see AI-powered insights
            </p>
          </CardContent>
        </Card>
      )}

      {/* Manual Analysis Modal */}
      <Modal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        title="Manual Code Analysis"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="File Path"
            placeholder="src/components/MyComponent.tsx"
            value={manualData.filePath}
            onChange={(e) => setManualData({ ...manualData, filePath: e.target.value })}
          />
          <Input
            label="Function/Class Name"
            placeholder="myFunction"
            value={manualData.function}
            onChange={(e) => setManualData({ ...manualData, function: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Code
            </label>
            <textarea
              value={manualData.newCode}
              onChange={(e) => setManualData({ ...manualData, newCode: e.target.value })}
              rows={10}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Paste your code here..."
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={() => setIsManualModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleManualAnalysis}
              isLoading={manualAnalysisMutation.isPending}
              disabled={!manualData.filePath || !manualData.function || !manualData.newCode}
            >
              Analyze Code
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Made with Bob

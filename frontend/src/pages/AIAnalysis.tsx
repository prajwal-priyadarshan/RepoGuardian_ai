import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  AlertTriangle,
  ChevronRight,
  ArrowRight,
  Code2,
  GitCommit,
  ShieldCheck,
  Activity,
  Maximize2
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  LoadingSpinner,
} from '../components/ui';
import { useAppStore } from '../store/useAppStore';
import { useAIAnalysis } from '../hooks/useAPI';

export const AIAnalysis = () => {
  const { repositories, aiAnalysis } = useAppStore();
  const [selectedRepoId, setSelectedRepoId] = useState('');
  const analysisMutation = useAIAnalysis();

  const handleAnalyze = async () => {
    if (!selectedRepoId) return;
    await analysisMutation.mutateAsync({ repo_id: selectedRepoId });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Configuration Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 p-8 bg-black border border-red-900/30 rounded-md">
        <div className="flex items-center space-x-5">
          <img src="/favicon.png" className="w-16 h-16 rounded-md shadow-lg shadow-red-950/50 object-cover" alt="AI Core Logo" />
          <div>
            <h1 className="text-2xl font-bold text-white">AI Intelligence Core</h1>
            <p className="text-sm font-medium text-white/60 mt-1">Deep architectural reasoning powered by Llama 3.3 & RAG.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <select
              value={selectedRepoId}
              onChange={(e) => setSelectedRepoId(e.target.value)}
              className="appearance-none bg-red-950/10 border border-red-900/30 text-white text-sm font-bold rounded-md focus:ring-red-500 focus:border-red-500 block w-full lg:w-64 p-3 pr-10"
            >
              <option value="" className="bg-black text-white">Select Knowledge Base</option>
              {repositories.map((repo) => (
                <option key={repo.id} value={repo.id} className="bg-black text-white">
                  {repo.name}
                </option>
              ))}
            </select>
            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 rotate-90 pointer-events-none" />
          </div>

          <Button
            onClick={handleAnalyze}
            isLoading={analysisMutation.isPending}
            disabled={!selectedRepoId}
            className="h-12 px-8 rounded-md bg-red-600 hover:bg-red-700 text-white font-bold shadow-xl shadow-red-950/50 active:scale-95 transition-all flex items-center space-x-2"
          >
            <Zap className="w-4 h-4 text-white" />
            <span>Detect & Analyze Changes</span>
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {analysisMutation.isPending ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-32 space-y-6"
          >
            <div className="relative">
              <LoadingSpinner size="lg" />
              <div className="absolute inset-0 animate-ping opacity-20"><LoadingSpinner size="lg" /></div>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white">LLM Reasoning in Progress</p>
              <p className="text-sm font-medium text-white/40 mt-1 uppercase tracking-widest">Querying Pinecone & Neo4j context...</p>
            </div>
          </motion.div>
        ) : aiAnalysis && aiAnalysis.analyses?.length > 0 ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Analysis Overview */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border border-red-900/20 shadow-premium bg-black">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-md bg-red-950/20 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                    <h3 className="font-bold text-white">Change Impact</h3>
                  </div>
                  <p className="text-3xl font-black text-white">Detected</p>
                  <p className="text-xs font-bold text-white/40 mt-2 uppercase tracking-wider">{aiAnalysis.analyses.length} entities analyzed</p>
                </CardContent>
              </Card>
              <Card className="border border-red-900/20 shadow-premium bg-black">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-md bg-red-950/20 flex items-center justify-center">
                      <Activity className="w-5 h-5 text-red-500" />
                    </div>
                    <h3 className="font-bold text-white">Reasoning Score</h3>
                  </div>
                  <p className="text-3xl font-black text-white">High</p>
                  <p className="text-xs font-bold text-white/40 mt-2 uppercase tracking-wider">Semantic relevance accuracy</p>
                </CardContent>
              </Card>
              <Card className="border border-red-900/20 shadow-premium bg-black">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 rounded-md bg-red-950/20 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-red-500" />
                    </div>
                    <h3 className="font-bold text-white">Fix Status</h3>
                  </div>
                  <p className="text-3xl font-black text-white">Available</p>
                  <p className="text-xs font-bold text-white/40 mt-2 uppercase tracking-wider">Healing protocol prepared</p>
                </CardContent>
              </Card>
            </div>

            {/* Detailed Content */}
            <div className="grid lg:grid-cols-5 gap-8">
              <div className="lg:col-span-3 space-y-8">
                {aiAnalysis.analyses.map((analysis, idx) => (
                  <Card key={idx} className="border border-red-900/10 shadow-premium overflow-hidden bg-black">
                    <CardHeader className="bg-red-600 text-white p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Code2 className="w-5 h-5 text-white" />
                          <CardTitle className="text-lg">{analysis.function}</CardTitle>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-red-900/20 text-[10px] font-bold tracking-widest uppercase text-white/60">
                          RAG Context
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-8">
                      <div className="prose prose-invert max-w-none">
                        <div className="flex items-start space-x-4 p-5 bg-red-950/10 rounded-md border border-red-900/20 mb-8">
                          <div className="w-10 h-10 min-w-[40px] bg-black border border-red-900/20 rounded-md shadow-sm flex items-center justify-center">
                            <GitCommit className="w-5 h-5 text-red-500" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1">Impact Analysis</p>
                            <p className="text-sm font-bold text-white">{analysis.why_breaks}</p>
                          </div>
                        </div>
                        <p className="text-white/80 leading-relaxed font-medium">
                          {analysis.explanation}
                        </p>
                        {analysis.suggestions?.length > 0 && (
                          <div className="mt-8 space-y-3">
                            <p className="text-sm font-bold text-white uppercase tracking-widest">Core Suggestions</p>
                            {analysis.suggestions.map((s, i) => (
                              <div key={i} className="flex items-center space-x-2 text-sm text-white/60">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                <span>{s}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="lg:col-span-2 space-y-8">
                <Card className="border border-red-900/30 shadow-premium bg-black text-white overflow-hidden">
                  <CardHeader className="border-b border-red-900/20 bg-red-950/20">
                    <h3 className="text-lg font-bold flex items-center">
                      <Zap className="w-5 h-5 mr-3 text-red-500" />
                      Code Fix Preview
                    </h3>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-red-950/10 rounded-md border border-red-900/20">
                        <p className="text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Automated Patch</p>
                        <code className="text-xs text-red-400 font-mono whitespace-pre-wrap">
                          {aiAnalysis.analyses[0]?.fixed_code?.substring(0, 200)}...
                        </code>
                      </div>
                      <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 rounded-md">
                        Generate Pull Request
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <div className="p-8 rounded-md bg-red-950/10 border border-red-900/20 relative overflow-hidden group">
                  <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-900/10 rounded-full blur-2xl group-hover:scale-110 transition-transform" />
                  <h4 className="text-white font-bold mb-3 flex items-center">
                    <AlertTriangle className="w-4 h-4 mr-2 text-red-500" />
                    Risk Disclosure
                  </h4>
                  <p className="text-white/70 text-sm leading-relaxed font-medium">
                    The identified risks include potential disruptions in downstream services that depend on these functions. Review the <strong>Impact Map</strong> for details.
                  </p>
                  <div className="mt-6 flex items-center text-xs font-bold text-red-500 cursor-pointer group-hover:translate-x-1 transition-transform">
                    Explore dependency tree <Maximize2 className="w-3 h-3 ml-1" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center bg-black border border-red-900/20 border-dashed rounded-md"
          >
            <div className="w-20 h-20 bg-red-950/10 rounded-md flex items-center justify-center mb-6">
              <Activity className="w-10 h-10 text-white/20" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Core Ready for Analysis</h3>
            <p className="text-white/40 max-w-sm mx-auto font-medium">
              Select a repository and trigger a scan to let the AI analyze the structural impact of your latest commits.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


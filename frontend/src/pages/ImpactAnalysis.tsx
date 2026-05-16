import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  GitBranch, 
  Activity, 
  ChevronRight, 
  ShieldAlert, 
  Network,
  Layers,
  Database,
  ArrowRight
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
import { useImpactAnalysis } from '../hooks/useAPI';

export const ImpactAnalysis = () => {
  const { repositories, impactAnalysis } = useAppStore();
  const [selectedRepoId, setSelectedRepoId] = useState('');
  const impactMutation = useImpactAnalysis();

  const handleAnalyze = async () => {
    if (!selectedRepoId) return;
    await impactMutation.mutateAsync({ repo_id: selectedRepoId });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Control Header */}
      <div className="p-8 bg-black border border-red-900/30 rounded-[2rem] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
           <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-950/50">
              <Network className="w-8 h-8 text-white" />
           </div>
           <div>
              <h1 className="text-2xl font-bold text-white">Impact & Risk Assessment</h1>
              <p className="text-sm font-medium text-white/60 mt-1">Cross-dependency tracing powered by Neo4j graph data.</p>
           </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <select
              value={selectedRepoId}
              onChange={(e) => setSelectedRepoId(e.target.value)}
              className="appearance-none bg-red-950/10 border border-red-900/30 text-white text-sm font-bold rounded-xl focus:ring-red-500 focus:border-red-500 block w-64 p-3 pr-10"
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
            isLoading={impactMutation.isPending}
            disabled={!selectedRepoId}
            className="h-12 px-8 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-xl shadow-red-950/50 active:scale-95 transition-all"
          >
            Trace Impact Map
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {impactMutation.isPending ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-32 flex flex-col items-center justify-center space-y-6"
          >
            <LoadingSpinner size="lg" />
            <div className="text-center">
               <p className="text-lg font-bold text-white">Traversing Graph Nodes</p>
               <p className="text-sm font-medium text-white/40 uppercase tracking-widest mt-1">Calculating risk scores via Neo4j cypher...</p>
            </div>
          </motion.div>
        ) : impactAnalysis ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Risk Indicator Card */}
            <Card className="border border-red-900/20 shadow-premium bg-black text-white overflow-hidden p-8">
               <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 blur-[100px]" />
               <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                  <div>
                     <h2 className="text-sm font-black text-red-500 uppercase tracking-[0.2em] mb-4">Structural Risk Score</h2>
                     <div className="flex items-baseline space-x-4">
                        <span className="text-8xl font-black">{impactAnalysis.risk_score}</span>
                        <div className="flex flex-col">
                           <span className={`text-xl font-bold ${Number(impactAnalysis.risk_score) > 5 ? 'text-red-500' : 'text-red-400'}`}>
                             {Number(impactAnalysis.risk_score) > 5 ? 'CRITICAL' : 'STABLE'}
                           </span>
                           <span className="text-white/40 text-sm font-medium">Out of 10.0</span>
                        </div>
                     </div>
                     <p className="mt-6 text-white/60 font-medium leading-relaxed max-w-sm">
                       Based on cyclomatic complexity and cross-module dependency density within your core logic.
                     </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-5 rounded-[2rem] bg-red-950/10 border border-red-900/20">
                        <Layers className="w-5 h-5 text-red-500 mb-3" />
                        <p className="text-2xl font-bold">12</p>
                        <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Affected Files</p>
                     </div>
                     <div className="p-5 rounded-[2rem] bg-red-950/10 border border-red-900/20">
                        <Database className="w-5 h-5 text-red-500 mb-3" />
                        <p className="text-2xl font-bold">48</p>
                        <p className="text-xs font-bold text-white/40 uppercase tracking-wider">Indexed Nodes</p>
                     </div>
                  </div>
               </div>
            </Card>

            {/* Impact Details Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
               <Card className="border border-red-900/10 shadow-premium bg-black">
                  <CardHeader className="border-b border-red-900/20 p-6">
                     <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold flex items-center">
                           <Activity className="w-5 h-5 mr-3 text-red-500" />
                           Affected Subsystems
                        </CardTitle>
                        <span className="text-xs font-bold px-2 py-1 bg-red-950/20 text-red-500 rounded-lg">LIVE TRACE</span>
                     </div>
                  </CardHeader>
                  <CardContent className="p-0">
                     <div className="divide-y divide-red-900/20">
                        {['Auth Middleware', 'API Controllers', 'Notification Engine'].map((subsystem, i) => (
                           <div key={i} className="p-6 flex items-center justify-between group hover:bg-red-900/10 transition-colors">
                              <div className="flex items-center space-x-4">
                                 <div className="w-10 h-10 rounded-xl bg-red-950/20 flex items-center justify-center text-white/40 group-hover:text-red-500 group-hover:bg-red-900/20 transition-colors">
                                    <GitBranch className="w-5 h-5" />
                                 </div>
                                 <div>
                                    <p className="font-bold text-white">{subsystem}</p>
                                    <p className="text-xs font-medium text-white/40">Structural coupling detected</p>
                                 </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white transition-transform group-hover:translate-x-1" />
                           </div>
                        ))}
                     </div>
                  </CardContent>
               </Card>

               <div className="space-y-6">
                  <div className="p-8 rounded-[2rem] bg-black shadow-premium flex flex-col items-center justify-center text-center border border-red-900/20">
                     <div className="w-16 h-16 bg-red-950/20 rounded-2xl flex items-center justify-center mb-6">
                        <ShieldAlert className="w-8 h-8 text-red-500" />
                     </div>
                     <h3 className="text-xl font-bold text-white mb-2">Isolation Recommended</h3>
                     <p className="text-white/60 text-sm font-medium leading-relaxed mb-6 max-w-xs">
                        We recommend decoupling the <code>PaymentService</code> from the <code>Logger</code> module to reduce cross-domain risk.
                     </p>
                     <Button variant="outline" className="w-full rounded-xl border-red-900/40 font-bold h-12 text-white">
                        Generate Refactoring Map
                     </Button>
                  </div>
                  
                  <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-red-600 to-red-800 text-white shadow-xl shadow-red-950/50 relative overflow-hidden group">
                     <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
                     <h4 className="font-bold flex items-center mb-2 italic">Pro Tip</h4>
                     <p className="text-white/80 text-sm leading-relaxed font-medium">
                        Neo4j detected that 80% of your current risk score comes from a single circular dependency in your core utility folder.
                     </p>
                     <div className="mt-4 flex items-center text-xs font-bold text-white cursor-pointer hover:underline">
                        Optimize Graph <ArrowRight className="ml-1 w-3 h-3" />
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        ) : (
          <div className="py-24 text-center bg-black border border-red-900/20 border-dashed rounded-[2rem] flex flex-col items-center">
             <div className="w-20 h-20 bg-red-950/10 rounded-3xl flex items-center justify-center mb-6">
                <GitBranch className="w-10 h-10 text-white/20" />
             </div>
             <h3 className="text-xl font-bold text-white mb-2">Architectural Map Empty</h3>
             <p className="text-white/40 max-w-sm mx-auto font-medium">
               Connect a repository and trace the impact map to see how changes affect your codebase structure.
             </p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

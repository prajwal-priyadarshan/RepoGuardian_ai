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
      <div className="p-8 glass-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-5">
           <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-100">
              <Network className="w-8 h-8 text-white" />
           </div>
           <div>
              <h1 className="text-2xl font-bold text-slate-900">Impact & Risk Assessment</h1>
              <p className="text-sm font-medium text-slate-500 mt-1">Cross-dependency tracing powered by Neo4j graph data.</p>
           </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <select
              value={selectedRepoId}
              onChange={(e) => setSelectedRepoId(e.target.value)}
              className="appearance-none bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block w-64 p-3 pr-10"
            >
              <option value="">Select Knowledge Base</option>
              {repositories.map((repo) => (
                <option key={repo.id} value={repo.id}>
                  {repo.name}
                </option>
              ))}
            </select>
            <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
          </div>
          
          <Button
            onClick={handleAnalyze}
            isLoading={impactMutation.isPending}
            disabled={!selectedRepoId}
            className="h-12 px-8 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xl active:scale-95 transition-all"
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
               <p className="text-lg font-bold text-slate-900">Traversing Graph Nodes</p>
               <p className="text-sm font-medium text-slate-400 uppercase tracking-widest mt-1">Calculating risk scores via Neo4j cypher...</p>
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
            <Card className="border-none shadow-premium bg-slate-900 text-white overflow-hidden p-8">
               <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 blur-[100px]" />
               <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                  <div>
                     <h2 className="text-sm font-black text-indigo-400 uppercase tracking-[0.2em] mb-4">Structural Risk Score</h2>
                     <div className="flex items-baseline space-x-4">
                        <span className="text-8xl font-black">{impactAnalysis.risk_score}</span>
                        <div className="flex flex-col">
                           <span className={`text-xl font-bold ${Number(impactAnalysis.risk_score) > 5 ? 'text-red-400' : 'text-emerald-400'}`}>
                             {Number(impactAnalysis.risk_score) > 5 ? 'CRITICAL' : 'STABLE'}
                           </span>
                           <span className="text-slate-400 text-sm font-medium">Out of 10.0</span>
                        </div>
                     </div>
                     <p className="mt-6 text-slate-400 font-medium leading-relaxed max-w-sm">
                       Based on cyclomatic complexity and cross-module dependency density within your core logic.
                     </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="p-5 rounded-[2rem] bg-slate-800/50 border border-slate-700">
                        <Layers className="w-5 h-5 text-indigo-400 mb-3" />
                        <p className="text-2xl font-bold">12</p>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Affected Files</p>
                     </div>
                     <div className="p-5 rounded-[2rem] bg-slate-800/50 border border-slate-700">
                        <Database className="w-5 h-5 text-indigo-400 mb-3" />
                        <p className="text-2xl font-bold">48</p>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Indexed Nodes</p>
                     </div>
                  </div>
               </div>
            </Card>

            {/* Impact Details Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
               <Card className="border-none shadow-premium bg-white">
                  <CardHeader className="border-b border-slate-50 p-6">
                     <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold flex items-center">
                           <Activity className="w-5 h-5 mr-3 text-blue-600" />
                           Affected Subsystems
                        </CardTitle>
                        <span className="text-xs font-bold px-2 py-1 bg-slate-50 text-slate-500 rounded-lg">LIVE TRACE</span>
                     </div>
                  </CardHeader>
                  <CardContent className="p-0">
                     <div className="divide-y divide-slate-50">
                        {['Auth Middleware', 'API Controllers', 'Notification Engine'].map((subsystem, i) => (
                           <div key={i} className="p-6 flex items-center justify-between group hover:bg-slate-50/50 transition-colors">
                              <div className="flex items-center space-x-4">
                                 <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-colors">
                                    <GitBranch className="w-5 h-5" />
                                 </div>
                                 <div>
                                    <p className="font-bold text-slate-900">{subsystem}</p>
                                    <p className="text-xs font-medium text-slate-400">Structural coupling detected</p>
                                 </div>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-900 transition-transform group-hover:translate-x-1" />
                           </div>
                        ))}
                     </div>
                  </CardContent>
               </Card>

               <div className="space-y-6">
                  <div className="p-8 rounded-[2rem] bg-white shadow-premium flex flex-col items-center justify-center text-center border border-slate-100">
                     <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
                        <ShieldAlert className="w-8 h-8 text-emerald-600" />
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 mb-2">Isolation Recommended</h3>
                     <p className="text-slate-500 text-sm font-medium leading-relaxed mb-6 max-w-xs">
                        We recommend decoupling the <code>PaymentService</code> from the <code>Logger</code> module to reduce cross-domain risk.
                     </p>
                     <Button variant="outline" className="w-full rounded-xl border-slate-200 font-bold h-12">
                        Generate Refactoring Map
                     </Button>
                  </div>
                  
                  <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
                     <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-125 transition-transform" />
                     <h4 className="font-bold flex items-center mb-2 italic">Pro Tip</h4>
                     <p className="text-indigo-100 text-sm leading-relaxed font-medium">
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
          <div className="py-24 text-center glass-card border-dashed flex flex-col items-center">
             <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
                <GitBranch className="w-10 h-10 text-slate-300" />
             </div>
             <h3 className="text-xl font-bold text-slate-900 mb-2">Architectural Map Empty</h3>
             <p className="text-slate-500 max-w-sm mx-auto font-medium">
               Connect a repository and trace the impact map to see how changes affect your codebase structure.
             </p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

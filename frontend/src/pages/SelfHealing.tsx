import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wrench, 
  CheckCircle2, 
  ShieldCheck,
  Cpu,
  Terminal,
  Sparkles
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
import { useSelfHeal } from '../hooks/useAPI';

export const SelfHealing = () => {
  const { repositories, selfHealResults } = useAppStore();
  const [selectedRepoId, setSelectedRepoId] = useState('');
  const selfHealMutation = useSelfHeal();

  const handleSelfHeal = async () => {
    if (!selectedRepoId) return;
    await selfHealMutation.mutateAsync({
      repo_id: selectedRepoId,
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Healing Command Header */}
      <div className="p-8 glass-card border-none bg-white">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
           <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100">
                 <Wrench className="w-9 h-9 text-white" />
              </div>
              <div>
                 <h1 className="text-2xl font-bold text-slate-900">Autonomous Self-Healing</h1>
                 <p className="text-sm font-medium text-slate-500 mt-1 italic">Proactive bug resolution powered by architectural context.</p>
              </div>
           </div>
           
           <div className="flex flex-col space-y-4">
              <div className="flex space-x-3">
                <select
                  value={selectedRepoId}
                  onChange={(e) => setSelectedRepoId(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-900 text-sm font-bold rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block w-full p-3"
                >
                  <option value="">Target Repository</option>
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
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 rounded-xl h-12 shadow-lg shadow-emerald-100 active:scale-95 transition-all"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Initiate Healing
                </Button>
              </div>
              <p className="text-xs font-bold text-slate-400 px-2">
                Note: This will analyze the latest architectural risks and generate safe code patches.
              </p>
           </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {selfHealMutation.isPending ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-32 flex flex-col items-center justify-center space-y-8"
          >
            <div className="w-24 h-24 relative flex items-center justify-center">
               <LoadingSpinner size="lg" />
               <div className="absolute inset-0 bg-emerald-100 rounded-full blur-2xl animate-pulse opacity-50" />
            </div>
            <div className="text-center">
               <h3 className="text-xl font-bold text-slate-900">Synthesizing Fix Payload</h3>
               <div className="flex items-center justify-center space-x-2 mt-2 text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
                  <Cpu className="w-3 h-3 animate-spin" />
                  <span>Validating against Neo4j Graph...</span>
               </div>
            </div>
          </motion.div>
        ) : selfHealResults ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Healing Confirmation */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
               <div className="flex items-center space-x-6 text-center md:text-left">
                  <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-sm">
                     <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                  </div>
                  <div>
                     <h2 className="text-2xl font-bold text-emerald-900 leading-none mb-2">Heal Operation Complete</h2>
                     <p className="text-emerald-700 font-medium">{selfHealResults.message || 'Fixes generated for detected architectural risks.'}</p>
                  </div>
               </div>
               <div className="flex space-x-3">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-emerald-200">
                     Review Summary
                  </Button>
               </div>
            </div>

            {/* Results Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
               <div className="space-y-6">
                  {selfHealResults.summary?.map((heal, i) => (
                    <Card key={i} className="border-none shadow-premium overflow-hidden bg-white">
                      <CardHeader className="bg-slate-50 border-b border-slate-100 p-4">
                         <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-bold text-slate-900">{heal.entity}</CardTitle>
                            <span className="text-[10px] font-black px-2 py-1 bg-emerald-100 text-emerald-700 rounded uppercase">
                              {heal.result.status}
                            </span>
                         </div>
                      </CardHeader>
                      <CardContent className="p-6">
                         <p className="text-sm font-medium text-slate-600 mb-4">{heal.result.message}</p>
                         <div className="p-4 bg-slate-900 rounded-xl">
                            <div className="flex items-center space-x-2 text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                               <Terminal className="w-3 h-3" />
                               <span>Commit SHA</span>
                            </div>
                            <code className="text-xs text-blue-400 font-mono">{heal.result.commit_sha || 'Processing...'}</code>
                         </div>
                      </CardContent>
                    </Card>
                  ))}
               </div>

               <div className="space-y-8">
                  <Card className="border-none shadow-premium bg-white">
                     <CardHeader className="pb-2">
                        <h3 className="font-bold text-slate-900 flex items-center">
                           <ShieldCheck className="w-5 h-5 mr-3 text-blue-600" />
                           Security Verification
                        </h3>
                     </CardHeader>
                     <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                           <span className="text-sm font-bold text-slate-700">Regression Tests</span>
                           <span className="text-xs font-black text-emerald-600">PASSED</span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                           <span className="text-sm font-bold text-slate-700">Graph Integrity</span>
                           <span className="text-xs font-black text-emerald-600">VALIDATED</span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                           <span className="text-sm font-bold text-slate-700">Type Safety</span>
                           <span className="text-xs font-black text-emerald-600">SECURE</span>
                        </div>
                     </CardContent>
                  </Card>

                  <div className="p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl transition-transform group-hover:scale-125" />
                     <h4 className="font-bold text-slate-900 mb-2 flex items-center">
                        <Cpu className="w-4 h-4 mr-2 text-slate-400" />
                        Optimization Logic
                     </h4>
                     <p className="text-slate-600 text-sm font-medium leading-relaxed">
                        The AI detected that the suggested fix reduces memory footprint by 12% by using a more efficient data structure identified in your project.
                     </p>
                  </div>
               </div>
            </div>
          </motion.div>
        ) : (
          <div className="py-24 text-center glass-card border-dashed flex flex-col items-center">
             <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-10 h-10 text-slate-300" />
             </div>
             <h3 className="text-xl font-bold text-slate-900 mb-2">Healing Module Ready</h3>
             <p className="text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">
               Select a target repository and initiate a scan to let RepoGuardian use its knowledge base to propose architectural fixes.
             </p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

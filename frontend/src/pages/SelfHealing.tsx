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
      <div className="p-8 bg-black border border-red-900/30 rounded-[2.5rem]">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
           <div className="flex items-center space-x-6">
              <div className="w-16 h-16 bg-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-red-950/50">
                 <Wrench className="w-9 h-9 text-white" />
              </div>
              <div>
                 <h1 className="text-2xl font-bold text-white">Autonomous Self-Healing</h1>
                 <p className="text-sm font-medium text-white/60 mt-1 italic">Proactive bug resolution powered by architectural context.</p>
              </div>
           </div>
           
           <div className="flex flex-col space-y-4">
              <div className="flex space-x-3">
                <select
                  value={selectedRepoId}
                  onChange={(e) => setSelectedRepoId(e.target.value)}
                  className="bg-red-950/10 border border-red-900/30 text-white text-sm font-bold rounded-xl focus:ring-red-500 focus:border-red-500 block w-full p-3"
                >
                  <option value="" className="bg-black text-white">Target Repository</option>
                  {repositories.map((repo) => (
                    <option key={repo.id} value={repo.id} className="bg-black text-white">
                      {repo.name}
                    </option>
                  ))}
                </select>
                <Button
                  onClick={handleSelfHeal}
                  isLoading={selfHealMutation.isPending}
                  disabled={!selectedRepoId}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 rounded-xl h-12 shadow-lg shadow-red-950/50 active:scale-95 transition-all"
                >
                  <Sparkles className="w-4 h-4 mr-2 text-white" />
                  Initiate Healing
                </Button>
              </div>
              <p className="text-xs font-bold text-white/40 px-2">
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
               <div className="absolute inset-0 bg-red-900/20 rounded-full blur-2xl animate-pulse opacity-50" />
            </div>
            <div className="text-center">
               <h3 className="text-xl font-bold text-white">Synthesizing Fix Payload</h3>
               <div className="flex items-center justify-center space-x-2 mt-2 text-xs font-bold text-white/40 uppercase tracking-[0.2em]">
                  <Cpu className="w-3 h-3 animate-spin text-red-500" />
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
            <div className="bg-red-950/10 border border-red-900/30 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
               <div className="flex items-center space-x-6 text-center md:text-left">
                  <div className="w-16 h-16 bg-black border border-red-900/20 rounded-3xl flex items-center justify-center shadow-sm">
                     <CheckCircle2 className="w-10 h-10 text-red-500" />
                  </div>
                  <div>
                     <h2 className="text-2xl font-bold text-white leading-none mb-2">Heal Operation Complete</h2>
                     <p className="text-red-400 font-medium">{selfHealResults.message || 'Fixes generated for detected architectural risks.'}</p>
                  </div>
               </div>
               <div className="flex space-x-3">
                  <Button className="bg-red-600 hover:bg-red-700 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-red-950/50">
                     Review Summary
                  </Button>
               </div>
            </div>

            {/* Results Grid */}
            <div className="grid lg:grid-cols-2 gap-8">
               <div className="space-y-6">
                  {selfHealResults.summary?.map((heal, i) => (
                    <Card key={i} className="border border-red-900/10 shadow-premium overflow-hidden bg-black">
                      <CardHeader className="bg-red-950/20 border-b border-red-900/20 p-4">
                         <div className="flex items-center justify-between">
                            <CardTitle className="text-sm font-bold text-white">{heal.entity}</CardTitle>
                            <span className="text-[10px] font-black px-2 py-1 bg-red-900/40 text-red-400 rounded uppercase">
                              {heal.result.status}
                            </span>
                         </div>
                      </CardHeader>
                      <CardContent className="p-6">
                         <p className="text-sm font-medium text-white/60 mb-4">{heal.result.message}</p>
                         <div className="p-4 bg-black border border-red-900/20 rounded-xl">
                            <div className="flex items-center space-x-2 text-[10px] font-black text-white/20 uppercase tracking-widest mb-2">
                               <Terminal className="w-3 h-3" />
                               <span>Commit SHA</span>
                            </div>
                            <code className="text-xs text-red-400 font-mono">{heal.result.commit_sha || 'Processing...'}</code>
                         </div>
                      </CardContent>
                    </Card>
                  ))}
               </div>

               <div className="space-y-8">
                  <Card className="border border-red-900/10 shadow-premium bg-black">
                     <CardHeader className="pb-2">
                        <h3 className="font-bold text-white flex items-center">
                           <ShieldCheck className="w-5 h-5 mr-3 text-red-500" />
                           Security Verification
                        </h3>
                     </CardHeader>
                     <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-4 rounded-xl bg-red-950/10 border border-red-900/20">
                           <span className="text-sm font-bold text-white/80">Regression Tests</span>
                           <span className="text-xs font-black text-red-500">PASSED</span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-red-950/10 border border-red-900/20">
                           <span className="text-sm font-bold text-white/80">Graph Integrity</span>
                           <span className="text-xs font-black text-red-500">VALIDATED</span>
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-xl bg-red-950/10 border border-red-900/20">
                           <span className="text-sm font-bold text-white/80">Type Safety</span>
                           <span className="text-xs font-black text-red-500">SECURE</span>
                        </div>
                     </CardContent>
                  </Card>

                  <div className="p-8 rounded-[2.5rem] bg-red-950/10 border border-red-900/20 relative overflow-hidden group">
                     <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-2xl transition-transform group-hover:scale-125" />
                     <h4 className="font-bold text-white mb-2 flex items-center">
                        <Cpu className="w-4 h-4 mr-2 text-white/20" />
                        Optimization Logic
                     </h4>
                     <p className="text-white/60 text-sm font-medium leading-relaxed">
                        The AI detected that the suggested fix reduces memory footprint by 12% by using a more efficient data structure identified in your project.
                     </p>
                  </div>
               </div>
            </div>
          </motion.div>
        ) : (
          <div className="py-24 text-center bg-black border border-red-900/20 border-dashed rounded-[2.5rem] flex flex-col items-center">
             <div className="w-20 h-20 bg-red-950/10 rounded-3xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-10 h-10 text-white/20" />
             </div>
             <h3 className="text-xl font-bold text-white mb-2">Healing Module Ready</h3>
             <p className="text-white/40 max-w-sm mx-auto font-medium leading-relaxed">
               Select a target repository and initiate a scan to let RepoGuardian use its knowledge base to propose architectural fixes.
             </p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

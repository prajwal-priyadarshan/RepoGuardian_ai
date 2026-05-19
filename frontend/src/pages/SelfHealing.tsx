import { motion } from 'framer-motion';
import { WandSparkles, ShieldCheck, Activity, Brain, Loader2, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, Button } from '../components/ui';
import { selectCurrentRepo, useAppStore } from '../store/useAppStore';
import { getDisplayName } from '../lib/utils';
import { useSelfHeal } from '../hooks/useAPI';

export const SelfHealing = () => {
  const currentRepo = useAppStore(selectCurrentRepo);
  const selfHealResults = useAppStore((state) => state.selfHealResults);
  const [running, setRunning] = useState(false);
  const healMutation = useSelfHeal();

  const handleHeal = async () => {
    if (!currentRepo) {
      return;
    }

    try {
      setRunning(true);
      await healMutation.mutateAsync({ repo_id: currentRepo.id });
    } catch (error) {
      console.error(error);
    } finally {
      setRunning(false);
    }
  };

  const summary = selfHealResults?.summary ?? [];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border-red-900/20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-md bg-red-950/20 flex items-center justify-center">
                <WandSparkles className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Self Healing</h1>
                <p className="text-white/50">Automated fixes and recovery actions for the active repository.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-red-950/20 text-red-300 border border-red-900/30 text-sm">{currentRepo ? getDisplayName(currentRepo) : 'No repository selected'}</span>
              <span className="px-3 py-1 rounded-full bg-white/5 text-white/60 border border-white/10 text-sm">{healMutation.isPending || running ? 'Healing in progress' : 'Idle'}</span>
            </div>
          </div>
          <Button onClick={handleHeal} disabled={!currentRepo || running || healMutation.isPending} className="bg-red-600 text-white hover:bg-red-700">
            {(running || healMutation.isPending) ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
            Start Self-Heal
          </Button>
        </div>
      </motion.div>

      {!currentRepo ? (
        <Card className="border border-red-900/20 bg-black">
          <CardContent className="pt-10 pb-10 text-center text-white/50">No repository selected. Connect one in Repositories first.</CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border border-red-900/20 bg-black">
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center"><Activity className="w-6 h-6 text-red-500 mr-2" />Healing Actions</h2>
                <span className="text-xs font-bold uppercase tracking-widest text-white/40">Live mode</span>
              </div>

              <div className="space-y-4">
                {summary.length > 0 ? summary.map((item, index) => (
                  <div key={`${item.entity}-${index}`} className="p-4 rounded-md border border-red-900/20 bg-red-950/10">
                    <p className="text-white font-semibold">{item.entity}</p>
                    <p className="text-sm text-white/50 mt-1">{item.file}</p>
                    <p className="text-sm text-white/70 mt-2">{item.result.message}</p>
                    <p className="text-xs text-white/40 mt-2">Status: {item.result.status}</p>
                  </div>
                )) : (
                  <div className="p-4 rounded-md border border-red-900/20 bg-red-950/10 text-white/60">No self-healing results yet.</div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border border-red-900/20 bg-black">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center"><Brain className="w-5 h-5 text-red-500 mr-2" />Status</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-md border border-red-900/20 bg-red-950/10">
                    <span className="text-sm text-white/70 font-medium">Repository</span>
                    <span className="text-sm text-red-400 font-bold">{currentRepo ? getDisplayName(currentRepo) : 'None'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-md border border-red-900/20 bg-red-950/10">
                    <span className="text-sm text-white/70 font-medium">State</span>
                    <span className="text-sm text-red-400 font-bold">{healMutation.isPending || running ? 'Running' : 'Idle'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-red-900/20 bg-black">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center"><RotateCcw className="w-5 h-5 text-red-500 mr-2" />Next Step</h2>
                <p className="text-white/60 text-sm leading-relaxed">Trigger self-healing after a fresh analysis so the backend can generate repository-specific remediation output.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

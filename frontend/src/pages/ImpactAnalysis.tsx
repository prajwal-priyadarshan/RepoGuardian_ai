import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle, Layers, FileText, Zap, BarChart3, ChevronRight, BadgeCheck, Clock } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, Button } from '../components/ui';
import { selectCurrentRepo, useAppStore } from '../store/useAppStore';
import { useImpactAnalysis } from '../hooks/useAPI';

export const ImpactAnalysis = () => {
  const currentRepo = useAppStore(selectCurrentRepo);
  const impactAnalysis = useAppStore((state) => state.impactAnalysis);
  const [running, setRunning] = useState(false);
  const impactMutation = useImpactAnalysis();

  const activeRepo = currentRepo ?? null;
  const affected = impactAnalysis?.impact ?? [];
  const totalAffectedFiles = affected.reduce((count, item) => count + item.affected_files.length, 0);
  const totalContext = affected.reduce((count, item) => count + item.semantic_context.length, 0);

  const runImpact = async () => {
    if (!activeRepo) {
      return;
    }

    try {
      setRunning(true);
      await impactMutation.mutateAsync({ repo_id: activeRepo.id });
    } catch (error) {
      console.error(error);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 border-red-900/20"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-md bg-red-950/20 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Impact Analysis</h1>
                <p className="text-white/50">Live dependency and risk mapping for the active repository.</p>
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-red-950/20 text-red-300 border border-red-900/30 text-sm">
                {activeRepo?.name ?? 'No repository selected'}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 text-white/60 border border-white/10 text-sm">
                Risk {impactAnalysis?.risk_score?.toFixed(2) ?? '0.00'}
              </span>
            </div>
          </div>
          <Button
            onClick={runImpact}
            disabled={!activeRepo || running || impactMutation.isPending}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {(running || impactMutation.isPending) ? <Clock className="w-4 h-4 mr-2 animate-spin" /> : <Zap className="w-4 h-4 mr-2" />}
            Analyze Impact
          </Button>
        </div>
      </motion.div>

      {!activeRepo ? (
        <Card className="border border-red-900/20 bg-black">
          <CardContent className="pt-10 pb-10 text-center text-white/50">
            No repository selected. Connect one in Repositories first.
          </CardContent>
        </Card>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2 border border-red-900/20 bg-black">
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white flex items-center"><Layers className="w-6 h-6 text-red-500 mr-2" />Dependency Impact</h2>
                <span className="text-xs font-bold uppercase tracking-widest text-white/40">{affected.length ? `${affected.length} findings` : 'No analysis yet'}</span>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-md border border-red-900/20 bg-red-950/10">
                  <p className="text-xs text-white/40 uppercase font-bold tracking-widest">Affected Groups</p>
                  <p className="text-xl text-white font-bold mt-1">{affected.length}</p>
                </div>
                <div className="p-4 rounded-md border border-red-900/20 bg-red-950/10">
                  <p className="text-xs text-white/40 uppercase font-bold tracking-widest">Affected Files</p>
                  <p className="text-xl text-white font-bold mt-1">{totalAffectedFiles}</p>
                </div>
                <div className="p-4 rounded-md border border-red-900/20 bg-red-950/10">
                  <p className="text-xs text-white/40 uppercase font-bold tracking-widest">Semantic Context</p>
                  <p className="text-xl text-white font-bold mt-1">{totalContext}</p>
                </div>
              </div>

              <div className="space-y-4">
                {affected.length > 0 ? affected.map((item, index) => (
                  <motion.div
                    key={`${item.function}-${index}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                    className="p-4 rounded-md border border-red-900/20 bg-red-950/10 flex items-center justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <FileText className="w-4 h-4 text-red-500 mt-1" />
                      <div>
                        <p className="text-white font-semibold">{item.function}</p>
                        <p className="text-sm text-white/50 mt-1">{item.affected_files.join(', ')}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-white/30" />
                  </motion.div>
                )) : (
                  <div className="p-4 rounded-md border border-red-900/20 bg-red-950/10 text-white/60">
                    No impacted files reported yet.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border border-red-900/20 bg-black">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                  Semantic Context
                </h2>
                <div className="space-y-3">
                  {affected.flatMap((item) => item.semantic_context).length > 0 ? affected.flatMap((item) => item.semantic_context).slice(0, 8).map((item, index) => (
                    <div key={`${item}-${index}`} className="flex items-start gap-3 p-3 rounded-md border border-red-900/20 bg-red-950/10">
                      <BadgeCheck className="w-4 h-4 text-red-500 mt-0.5" />
                      <p className="text-sm text-white/70">{item}</p>
                    </div>
                  )) : (
                    <div className="text-sm text-white/50">No semantic context available yet.</div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-red-900/20 bg-black">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 text-red-500 mr-2" />
                  Impact Summary
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-md border border-red-900/20 bg-red-950/10">
                    <span className="text-sm text-white/70 font-medium">Risk Score</span>
                    <span className="text-sm text-red-400 font-bold">{impactAnalysis?.risk_score?.toFixed(2) ?? 'N/A'}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-md border border-red-900/20 bg-red-950/10">
                    <span className="text-sm text-white/70 font-medium">Changed Functions</span>
                    <span className="text-sm text-red-400 font-bold">{impactAnalysis?.changed_functions?.functions.length ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-md border border-red-900/20 bg-red-950/10">
                    <span className="text-sm text-white/70 font-medium">Diff Ready</span>
                    <span className="text-sm text-red-400 font-bold">{impactAnalysis?.changed_functions ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

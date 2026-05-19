import { motion } from 'framer-motion';
import { Brain, Shield, Code2, AlertTriangle, Lightbulb, CheckCircle2, Sparkles, Clock3 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Card, CardContent, Button } from '../components/ui';
import { selectCurrentRepo, useAppStore } from '../store/useAppStore';
import { getDisplayName } from '../lib/utils';
import { useAIAnalysis } from '../hooks/useAPI';

export const AIAnalysis = () => {
  const currentRepo = useAppStore(selectCurrentRepo);
  const aiAnalysis = useAppStore((state) => state.aiAnalysis);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const analysisMutation = useAIAnalysis();

  const activeRepo = currentRepo ?? null;
  const analysis = useMemo(() => (aiAnalysis?.repo_id === activeRepo?.id ? aiAnalysis : aiAnalysis ?? null), [activeRepo, aiAnalysis]);

  const handleRefresh = async () => {
    if (!activeRepo) {
      return;
    }

    try {
      setIsRefreshing(true);
      await analysisMutation.mutateAsync({ repo_id: activeRepo.id });
    } catch (error) {
      console.error(error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const sections = analysis?.analyses ?? [];
  const maxRisk = sections.reduce((highest, section) => Math.max(highest, section.risk_score ?? 0), 0);

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
                <Brain className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">AI Analysis</h1>
                <p className="text-white/50">Live reasoning output generated from the selected repository.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-red-950/20 text-red-300 border border-red-900/30 text-sm">
                {activeRepo ? getDisplayName(activeRepo) : 'No repository selected'}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/5 text-white/60 border border-white/10 text-sm">
                {analysis ? 'Analysis ready' : 'Awaiting analysis'}
              </span>
            </div>
          </div>

          <Button
            onClick={handleRefresh}
            disabled={!activeRepo || isRefreshing || analysisMutation.isPending}
            className="bg-red-600 text-white hover:bg-red-700"
          >
            {(isRefreshing || analysisMutation.isPending) ? (
              <Clock3 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Refresh Analysis
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
                <h2 className="text-2xl font-bold text-white">Repository Overview</h2>
                    <span className="px-3 py-1 rounded-full bg-red-950/20 text-red-300 border border-red-900/30 text-sm">
                      {sections.length ? `${sections.length} findings` : 'No findings'}
                    </span>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 rounded-md border border-red-900/20 bg-red-950/10">
                      <p className="text-xs text-white/40 uppercase font-bold tracking-widest">Repository</p>
                      <p className="text-xl text-white font-bold mt-1">{getDisplayName(activeRepo)}</p>
                </div>
                <div className="p-4 rounded-md border border-red-900/20 bg-red-950/10">
                      <p className="text-xs text-white/40 uppercase font-bold tracking-widest">Analysis Count</p>
                      <p className="text-xl text-white font-bold mt-1">{sections.length}</p>
                </div>
                <div className="p-4 rounded-md border border-red-900/20 bg-red-950/10">
                      <p className="text-xs text-white/40 uppercase font-bold tracking-widest">Max Risk Score</p>
                      <p className="text-xl text-white font-bold mt-1">{maxRisk.toFixed(2)}</p>
                </div>
              </div>

              <div className="space-y-4">
                {sections.length > 0 ? sections.map((section, index) => (
                  <motion.div
                        key={`${section.function}-${index}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4 rounded-md border border-red-900/20 bg-red-950/10"
                  >
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-red-500" />
                            <h3 className="text-white font-semibold">{section.function}</h3>
                      </div>
                          <span className="text-xs text-white/40 uppercase tracking-wider">Risk {section.risk_score?.toFixed(2) ?? 'N/A'}</span>
                    </div>
                        <p className="text-white/70 leading-relaxed mb-3">{section.explanation}</p>
                        <p className="text-white/50 text-sm mb-3">{section.why_breaks}</p>
                        <ul className="space-y-2 text-sm text-white/60">
                          {section.risks.map((risk) => (
                            <li key={risk} className="flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5" />
                              <span>{risk}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-3 p-3 rounded-md bg-black/40 border border-white/10 text-xs text-white/50 overflow-x-auto">
                          <pre className="whitespace-pre-wrap">{section.fixed_code}</pre>
                        </div>
                  </motion.div>
                )) : (
                  <div className="p-4 rounded-md border border-red-900/20 bg-red-950/10 text-white/60">
                    No AI analysis has been generated yet for this repository.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="border border-red-900/20 bg-black">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Shield className="w-5 h-5 text-red-500 mr-2" />
                  Quality Signals
                </h2>
                <div className="space-y-3">
                  {[
                    ['Repository ID', analysis?.repo_id ?? 'N/A'],
                    ['Findings', sections.length.toString()],
                    ['Risk Score', maxRisk.toFixed(2)],
                    ['Message', analysis?.message ?? 'N/A'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center justify-between p-3 rounded-md border border-red-900/20 bg-red-950/10">
                      <span className="text-sm text-white/70 font-medium">{label}</span>
                      <span className="text-sm text-red-400 font-bold">{value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border border-red-900/20 bg-black">
              <CardContent className="pt-6">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Lightbulb className="w-5 h-5 text-red-500 mr-2" />
                  Suggested Actions
                </h2>
                <div className="space-y-3">
                  {sections.length > 0 ? sections.flatMap((section) => section.suggestions).slice(0, 6).map((item, index) => (
                    <div key={`${item}-${index}`} className="flex items-start gap-3 p-3 rounded-md border border-red-900/20 bg-red-950/10">
                      <CheckCircle2 className="w-4 h-4 text-red-500 mt-0.5" />
                      <p className="text-sm text-white/70">{item}</p>
                    </div>
                  )) : (
                    <div className="text-sm text-white/50">No recommendations available yet.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

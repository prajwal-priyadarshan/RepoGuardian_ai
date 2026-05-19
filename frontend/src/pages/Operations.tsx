import { motion } from 'framer-motion';
import { Activity, Clock, Database, Loader2, Sparkles, TrendingUp } from 'lucide-react';
import { Card, CardContent, Button } from '../components/ui';
import { selectCurrentRepo, useAppStore } from '../store/useAppStore';
import { getDisplayName } from '../lib/utils';
import { useSyncRepo } from '../hooks/useAPI';
import { useMemo, useState } from 'react';

export const Operations = () => {
  const repositories = useAppStore((state) => state.repositories);
  const currentRepo = useAppStore(selectCurrentRepo);
  const syncMutation = useSyncRepo();
  const [runningRepoId, setRunningRepoId] = useState<string | null>(null);

  const sourceCounts = useMemo(() => ({
    github: repositories.filter((repo) => repo.source === 'github').length,
    upload: repositories.filter((repo) => repo.source === 'upload').length,
  }), [repositories]);

  const handleSync = async (repoId: string) => {
    setRunningRepoId(repoId);
    try {
      await syncMutation.mutateAsync(repoId);
    } catch (error) {
      console.error(error);
    } finally {
      setRunningRepoId(null);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border-red-900/20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-md bg-red-950/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Operations</h1>
                <p className="text-white/50">Repository sync state and live workspace signals.</p>
              </div>
            </div>
              <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-red-950/20 text-red-300 border border-red-900/30 text-sm">
                {currentRepo ? getDisplayName(currentRepo) : 'No repository selected'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <Card className="border border-red-900/20 bg-black"><CardContent className="pt-6"><p className="text-white/40 text-xs uppercase tracking-wider font-bold">Repositories</p><p className="text-3xl font-black text-white mt-1">{repositories.length}</p></CardContent></Card>
        <Card className="border border-red-900/20 bg-black"><CardContent className="pt-6"><p className="text-white/40 text-xs uppercase tracking-wider font-bold">GitHub</p><p className="text-3xl font-black text-white mt-1">{sourceCounts.github}</p></CardContent></Card>
        <Card className="border border-red-900/20 bg-black"><CardContent className="pt-6"><p className="text-white/40 text-xs uppercase tracking-wider font-bold">Uploads</p><p className="text-3xl font-black text-white mt-1">{sourceCounts.upload}</p></CardContent></Card>
        <Card className="border border-red-900/20 bg-black"><CardContent className="pt-6"><p className="text-white/40 text-xs uppercase tracking-wider font-bold">Selected</p><p className="text-3xl font-black text-white mt-1">{currentRepo ? '1' : '0'}</p></CardContent></Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border border-red-900/20 bg-black">
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center"><TrendingUp className="w-6 h-6 text-red-500 mr-2" />Repository Pipeline</h2>
              <span className="text-xs font-bold uppercase tracking-widest text-white/40">Live state</span>
            </div>

            <div className="space-y-4">
              {repositories.length > 0 ? repositories.map((repo) => (
                <div key={repo.id} className="p-4 rounded-md border border-red-900/20 bg-red-950/10 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-white font-bold">{getDisplayName(repo)}</p>
                    <p className="text-xs text-white/40 font-medium flex items-center mt-1">
                      <Clock className="w-3 h-3 mr-1" />
                      Added {new Date(repo.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-900/20 text-red-400 uppercase">
                      {repo.source}
                    </span>
                    <Button
                      variant="outline"
                      className="border-white/10 text-white hover:bg-white/5"
                      onClick={() => handleSync(repo.id)}
                      disabled={syncMutation.isPending && runningRepoId === repo.id}
                    >
                      {(syncMutation.isPending && runningRepoId === repo.id) ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Database className="w-4 h-4 mr-2" />}
                      Sync
                    </Button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-10 text-white/50">No repositories connected yet.</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border border-red-900/20 bg-black">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center"><Activity className="w-5 h-5 text-red-500 mr-2" />Operational Signals</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-md border border-red-900/20 bg-red-950/10">
                <span className="text-sm text-white/70 font-medium">Current Repo</span>
                <span className="text-sm text-red-400 font-bold">{currentRepo ? getDisplayName(currentRepo) : 'None'}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-md border border-red-900/20 bg-red-950/10">
                <span className="text-sm text-white/70 font-medium">GitHub</span>
                <span className="text-sm text-red-400 font-bold">{sourceCounts.github}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-md border border-red-900/20 bg-red-950/10">
                <span className="text-sm text-white/70 font-medium">Uploads</span>
                <span className="text-sm text-red-400 font-bold">{sourceCounts.upload}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-md border border-red-900/20 bg-red-950/10">
                <span className="text-sm text-white/70 font-medium">Alerts</span>
                <span className="text-sm text-red-400 font-bold">{repositories.length ? '0' : 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

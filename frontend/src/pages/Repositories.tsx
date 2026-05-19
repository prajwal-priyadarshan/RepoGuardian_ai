import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Plus, Clock, ShieldCheck, Search, Loader2, Link2, Upload, Sparkles, Database, X } from 'lucide-react';
import { Button } from '../components/ui';
import { selectCurrentRepo, useAppStore } from '../store/useAppStore';
import { getDisplayName } from '../lib/utils';
import { useUploadRepo, useCloneRepo } from '../hooks/useAPI';

export const Repositories = () => {
  const repositories = useAppStore((state) => state.repositories);
  const currentRepo = useAppStore(selectCurrentRepo);
  const currentRepoId = useAppStore((state) => state.currentRepoId);
  const setCurrentRepo = useAppStore((state) => state.setCurrentRepo);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectionType, setConnectionType] = useState<'url' | 'upload'>('url');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [repoName, setRepoName] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);

  const cloneMutation = useCloneRepo();
  const uploadMutation = useUploadRepo();

  const visibleRepositories = useMemo(() => {
    return repositories.filter((repo) => {
      const display = getDisplayName(repo).toLowerCase();
      const matchesSearch =
        searchTerm === '' ||
        display.includes(searchTerm.toLowerCase()) ||
        (repo.url ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        repo.source.includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [repositories, searchTerm]);

  // using shared getDisplayName from lib/utils

  const handleConnect = async () => {
    if (connectionType === 'url') {
      const cleanedUrl = repositoryUrl.trim();
      if (!cleanedUrl) {
        return;
      }

      const response = await cloneMutation.mutateAsync({ repo_url: cleanedUrl });
      setCurrentRepo(response.repo_id);
      setShowConnectModal(false);
      setRepositoryUrl('');
      return;
    }

    if (!uploadFile) {
      return;
    }

    const response = await uploadMutation.mutateAsync(uploadFile);
    setCurrentRepo(response.repo_id);
    setShowConnectModal(false);
    setRepoName('');
    setUploadFile(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-md bg-red-950/30 border border-red-900/40 flex items-center justify-center">
            <GitBranch className="w-7 h-7 text-red-500" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Repositories</h1>
            <p className="text-white/50 mt-1">Monitor, search, and scan connected repositories.</p>
          </div>
        </motion.div>

        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setShowConnectModal(true)} className="bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-900/20 px-5">
            <Plus className="w-4 h-4 mr-2" />
            Connect Knowledge Source
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="glass-card p-5 border-red-900/20">
          <p className="text-xs uppercase tracking-wider text-white/40 font-semibold">Total Repositories</p>
          <p className="text-2xl font-bold text-white">{repositories.length}</p>
        </div>
        <div className="glass-card p-5 border-red-900/20">
          <p className="text-xs uppercase tracking-wider text-white/40 font-semibold">Selected Repository</p>
          <p className="text-2xl font-bold text-white">{currentRepo ? getDisplayName(currentRepo) : 'None'}</p>
        </div>
        <div className="glass-card p-5 border-red-900/20">
          <p className="text-xs uppercase tracking-wider text-white/40 font-semibold">Source Type</p>
          <p className="text-2xl font-bold text-white">{currentRepo?.source ?? 'N/A'}</p>
        </div>
        <div className="glass-card p-5 border-red-900/20">
          <p className="text-xs uppercase tracking-wider text-white/40 font-semibold">Current Repo ID</p>
          <p className="text-2xl font-bold text-white">{currentRepoId ?? 'N/A'}</p>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-4 items-stretch xl:items-center justify-between">
        <div className="flex-1">
          <div className="relative max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              type="text"
              placeholder="Search repositories..."
              className="w-full h-12 pl-11 pr-4 rounded-md bg-black/40 border border-white/10 text-white placeholder:text-white/30 outline-none focus:border-red-600 transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-5">
        {visibleRepositories.length > 0 ? (
          visibleRepositories.map((repo, index) => (
            <motion.div
              key={repo.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`glass-card p-5 border transition-all duration-300 cursor-pointer ${currentRepoId === repo.id ? 'border-red-500/60' : 'border-white/10'}`}
              onClick={() => setCurrentRepo(repo.id)}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-md bg-red-950/20 flex items-center justify-center border border-white/10">
                    <GitBranch className="w-6 h-6 text-red-500" />
                  </div>

                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-xl font-bold text-white">{getDisplayName(repo)}</h3>
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-emerald-500/15 text-emerald-400">
                        {repo.source}
                      </span>
                    </div>
                    <p className="text-white/50 text-sm mt-1 max-w-2xl">{repo.url ?? 'Connected repository'}</p>

                    <div className="flex flex-wrap gap-4 mt-4 text-sm text-white/55">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-red-500" />
                        Added {new Date(repo.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Database className="w-4 h-4 text-red-500" />
                        {repo.lastSynced ? `Synced ${new Date(repo.lastSynced).toLocaleDateString()}` : 'Not synced yet'}
                      </span>
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-4 h-4 text-red-500" />
                        Live source
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="glass-card p-10 text-center border-dashed border-red-900/30">
            <Plus className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No repositories yet</h3>
            <p className="text-white/45 mb-6 max-w-lg mx-auto">Connect a GitHub repository or upload a codebase to start scanning and generating AI insights.</p>
            <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => setShowConnectModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Connect Knowledge Source
            </Button>
          </div>
        )}
      </div>

      {showConnectModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-3xl p-6 border-red-900/30 shadow-2xl shadow-red-950/30">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Connect Knowledge Source</h2>
                <p className="text-white/50 mt-1">Import a repository from GitHub or upload a local archive.</p>
              </div>
              <Button variant="ghost" className="text-white/50 hover:text-white" onClick={() => setShowConnectModal(false)}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="grid gap-6">
              <div className="flex items-center gap-3">
                <button
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${connectionType === 'url' ? 'bg-red-600 text-white border-red-600' : 'bg-black/30 text-white/60 border-white/10'}`}
                  onClick={() => setConnectionType('url')}
                >
                  <Link2 className="w-4 h-4 inline mr-2" />
                  GitHub URL
                </button>
                <button
                  className={`px-4 py-2 rounded-full border text-sm font-medium transition-all ${connectionType === 'upload' ? 'bg-red-600 text-white border-red-600' : 'bg-black/30 text-white/60 border-white/10'}`}
                  onClick={() => setConnectionType('upload')}
                >
                  <Upload className="w-4 h-4 inline mr-2" />
                  Upload Codebase
                </button>
              </div>

              {connectionType === 'url' ? (
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-white/60">Repository URL</label>
                  <input
                    type="url"
                    value={repositoryUrl}
                    onChange={(e) => setRepositoryUrl(e.target.value)}
                    placeholder="https://github.com/owner/repo.git"
                    className="w-full h-12 rounded-md bg-black/40 border border-white/10 text-white px-4 outline-none focus:border-red-600 transition-colors"
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Repository Name</label>
                    <input
                      type="text"
                      value={repoName}
                      onChange={(e) => setRepoName(e.target.value)}
                      placeholder="my-service"
                      className="w-full h-12 rounded-md bg-black/40 border border-white/10 text-white px-4 outline-none focus:border-red-600 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/60 mb-2">Archive File</label>
                    <input
                      type="file"
                      accept=".zip,.tar,.gz,.tgz"
                      onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                      className="w-full text-white/60 file:mr-4 file:rounded-md file:border-0 file:bg-red-600 file:px-4 file:py-2 file:text-white file:font-semibold hover:file:bg-red-700"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" className="border-white/10 text-white hover:bg-white/5" onClick={() => setShowConnectModal(false)}>
                  Cancel
                </Button>
                <Button className="bg-red-600 text-white hover:bg-red-700" onClick={handleConnect} disabled={cloneMutation.isPending || uploadMutation.isPending}>
                  {(cloneMutation.isPending || uploadMutation.isPending) ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  {connectionType === 'url' ? 'Connect & Scan' : 'Upload & Scan'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

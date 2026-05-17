import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Activity,
  Database,
  GitBranch,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Zap,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button, Input } from '../components/ui';
import { api } from '../lib/api.client';
import { useAppStore } from '../store/useAppStore';

type OperationResult = {
  title: string;
  endpoint: string;
  payload: unknown;
};

const formatPayload = (payload: unknown) => JSON.stringify(payload, null, 2);

export const Operations = () => {
  const { repositories, currentRepoId, setCurrentRepo } = useAppStore();
  const [repoId, setRepoId] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [isRunning, setIsRunning] = useState<string | null>(null);
  const [latestResult, setLatestResult] = useState<OperationResult | null>(null);
  const [serviceStatus, setServiceStatus] = useState<{ root?: unknown; health?: unknown }>({});

  useEffect(() => {
    if (!repoId && currentRepoId) {
      setRepoId(currentRepoId);
    }
  }, [currentRepoId, repoId]);

  const runOperation = async (title: string, endpoint: string, runner: () => Promise<unknown>) => {
    setIsRunning(endpoint);
    try {
      const payload = await runner();
      setLatestResult({ title, endpoint, payload });
    } finally {
      setIsRunning(null);
    }
  };

  const canUseRepo = repoId.trim().length > 0;

  const loadServiceStatus = async () => {
    setIsRunning('service-status');
    try {
      const [root, health] = await Promise.all([api.getRootStatus(), api.getHealthStatus()]);
      setServiceStatus({ root, health });
      setLatestResult({
        title: 'Backend Health',
        endpoint: 'GET / + GET /health',
        payload: { root, health },
      });
    } finally {
      setIsRunning(null);
    }
  };

  const syncSelectedRepo = (value: string) => {
    setRepoId(value);
    if (value) {
      setCurrentRepo(value);
    }
  };

  const resultText = latestResult ? formatPayload(latestResult.payload) : '// No backend request has been run yet.';

  return (
    <div className="space-y-8 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 bg-black border border-red-900/30 rounded-md shadow-premium"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-md bg-red-950/30 text-red-500 text-xs font-bold uppercase tracking-[0.2em]">
              <Database className="w-4 h-4" />
              <span>Integration Workspace</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white leading-tight">Frontend to Backend Operations</h1>
              <p className="text-white/60 mt-3 font-medium max-w-2xl">
                Run repository scanning, parsing, graph generation, git diffing, and pull request workflows from one themed control surface.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-center text-xs font-bold uppercase tracking-widest text-white/50">
            <div className="px-4 py-3 rounded-md bg-red-950/10 border border-red-900/20">
              {repositories.length}
              <div className="mt-1 text-white/30">Repositories</div>
            </div>
            <div className="px-4 py-3 rounded-md bg-red-950/10 border border-red-900/20">
              {currentRepoId || 'None'}
              <div className="mt-1 text-white/30">Current Repo</div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="border border-red-900/20 bg-black lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-red-500" />
              Repository Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Repository ID"
                placeholder="Paste a repo_id from clone/upload"
                value={repoId}
                onChange={(e) => syncSelectedRepo(e.target.value)}
              />
              <div className="space-y-2">
                <label className="block text-sm font-medium text-white/80">Repository Shortcut</label>
                <select
                  value={repoId}
                  onChange={(e) => syncSelectedRepo(e.target.value)}
                  className="flex h-10 w-full rounded-lg border border-red-900/40 bg-black px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="" className="bg-black text-white">Select an indexed repository</option>
                  {repositories.map((repo) => (
                    <option key={repo.id} value={repo.id} className="bg-black text-white">
                      {repo.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              <Button
                onClick={loadServiceStatus}
                isLoading={isRunning === 'service-status'}
                className="justify-between h-12 bg-red-600 text-white hover:bg-red-700 rounded-md"
              >
                Check Service Health
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => runOperation('Scan Repository', 'scan', () => api.scanRepo(repoId))}
                disabled={!canUseRepo}
                isLoading={isRunning === 'scan'}
                className="justify-between h-12 bg-black border border-red-900/40 text-white hover:bg-red-950/20 rounded-md"
              >
                Scan Files
                <Search className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => runOperation('Parse Repository', 'parse', () => api.parseRepo(repoId))}
                disabled={!canUseRepo}
                isLoading={isRunning === 'parse'}
                className="justify-between h-12 bg-black border border-red-900/40 text-white hover:bg-red-950/20 rounded-md"
              >
                Parse Structure
                <GitBranch className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => runOperation('Build Graph', 'graph-build', () => api.buildGraph(repoId))}
                disabled={!canUseRepo}
                isLoading={isRunning === 'graph-build'}
                className="justify-between h-12 bg-black border border-red-900/40 text-white hover:bg-red-950/20 rounded-md"
              >
                Build Graph
                <Database className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => runOperation('Git Diff', 'git-diff', () => api.gitDiff(repoId))}
                disabled={!canUseRepo}
                isLoading={isRunning === 'git-diff'}
                className="justify-between h-12 bg-black border border-red-900/40 text-white hover:bg-red-950/20 rounded-md"
              >
                Git Diff
                <Zap className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => runOperation('Clear Graph', 'graph-clear', () => api.clearGraph())}
                isLoading={isRunning === 'graph-clear'}
                className="justify-between h-12 bg-black border border-red-900/40 text-white hover:bg-red-950/20 rounded-md"
              >
                Clear Graph
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col items-start gap-3">
            <div className="text-xs font-bold uppercase tracking-widest text-white/40">Theme preserved: black + red control panel</div>
            <div className="text-sm text-white/60">All actions go through the existing backend service, no backend code changes required.</div>
          </CardFooter>
        </Card>

        <Card className="border border-red-900/20 bg-black">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-red-500" />
              Service Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border border-red-900/20 bg-red-950/10 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Root Status</p>
              <p className="text-sm text-white/80 break-words">{serviceStatus.root ? JSON.stringify(serviceStatus.root) : 'Not checked yet'}</p>
            </div>
            <div className="rounded-md border border-red-900/20 bg-red-950/10 p-4">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Health Endpoint</p>
              <p className="text-sm text-white/80 break-words">{serviceStatus.health ? JSON.stringify(serviceStatus.health) : 'Not checked yet'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="border border-red-900/20 bg-black">
          <CardHeader>
            <CardTitle>Pull Request Toolkit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="GitHub Token"
              placeholder="Optional token for PR creation"
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
            />
            <div className="grid sm:grid-cols-2 gap-4">
              <Button
                onClick={() => runOperation('Generate PR', 'pr-generate', () => api.generatePullRequest({ repo_id: repoId, github_token: githubToken || undefined }))}
                disabled={!canUseRepo}
                isLoading={isRunning === 'pr-generate'}
                className="justify-between h-12 bg-red-600 text-white hover:bg-red-700 rounded-md"
              >
                Generate PR
                <GitBranch className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => runOperation('Generate Patch', 'pr-patch', () => api.generatePullRequestPatch(repoId))}
                disabled={!canUseRepo}
                isLoading={isRunning === 'pr-patch'}
                className="justify-between h-12 bg-black border border-red-900/40 text-white hover:bg-red-950/20 rounded-md"
              >
                Raw Patch
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => runOperation('Generate Summary', 'pr-summary', () => api.generatePullRequestSummary({ repo_id: repoId, github_token: githubToken || undefined }))}
                disabled={!canUseRepo}
                isLoading={isRunning === 'pr-summary'}
                className="justify-between h-12 bg-black border border-red-900/40 text-white hover:bg-red-950/20 rounded-md"
              >
                PR Summary
                <Activity className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => runOperation('PR Risk Analysis', 'pr-risk', () => api.analyzePullRequestRisk(repoId))}
                disabled={!canUseRepo}
                isLoading={isRunning === 'pr-risk'}
                className="justify-between h-12 bg-black border border-red-900/40 text-white hover:bg-red-950/20 rounded-md"
              >
                Risk Analysis
                <Zap className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-red-900/20 bg-black">
          <CardHeader>
            <CardTitle>Latest Response</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-red-900/20 bg-black p-4 max-h-[420px] overflow-auto">
              <p className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-2">
                {latestResult ? `${latestResult.title} • ${latestResult.endpoint}` : 'Awaiting backend action'}
              </p>
              <pre className="text-xs leading-relaxed text-white/80 whitespace-pre-wrap break-words">
                {resultText}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
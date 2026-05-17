import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  GitBranch,
  Calendar,
  Plus,
  Search,
  Globe,
  MoreVertical,
  Users,
  Shield,
  BarChart3,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button, Input, Modal } from '../components/ui';

const demoRepositories = [
  {
    id: 'simple-app-demo',
    name: 'simple_app',
    url: 'https://github.com/prajwal-priyadarshan/simple_app',
    lastCommit: 'feat: add flutter scramble animation tuning',
    lastCommitAgo: '2 hours ago',
    contributors: 5,
    vulnerabilities: { critical: 0, high: 1, medium: 2 },
    aiSummary: 'Flutter word-scramble game app with clean widget separation, Riverpod-lite state updates, and lightweight local persistence.',
    commitActivity: [6, 3, 8, 5, 9, 4, 7],
    framework: 'Flutter',
    language: 'Dart',
  },
  {
    id: 'billing-core-demo',
    name: 'billing_core',
    url: 'https://github.com/acme/billing_core',
    lastCommit: 'refactor: isolate invoice retry queue processor',
    lastCommitAgo: '5 hours ago',
    contributors: 9,
    vulnerabilities: { critical: 1, high: 2, medium: 4 },
    aiSummary: 'Financial microservice with high transaction concurrency and strict reconciliation checks.',
    commitActivity: [3, 8, 7, 6, 5, 9, 4],
    framework: 'FastAPI',
    language: 'Python',
  },
];

export const Repositories = () => {
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [isIndexing, setIsIndexing] = useState(false);
  const [isConnectedDemoRepo, setIsConnectedDemoRepo] = useState(false);

  const repositories = useMemo(() => {
    if (isConnectedDemoRepo) return demoRepositories;
    return [demoRepositories[0]];
  }, [isConnectedDemoRepo]);

  const handleConnect = async () => {
    if (!repoUrl.trim()) return;
    setIsIndexing(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setIsConnectedDemoRepo(true);
    setRepoUrl('');
    setIsIndexing(false);
    setIsCloneModalOpen(false);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white leading-tight">Code Intelligence Base</h1>
          <p className="text-white/60 mt-2 font-medium">
            Demo mode with realistic repository metadata and indexing telemetry.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-4 py-2 rounded-md border border-red-900/30 bg-red-950/10 text-xs font-bold uppercase tracking-widest text-white/70">
            Total Repos: <span className="text-red-400">23</span>
          </div>
          <div className="px-4 py-2 rounded-md border border-red-900/30 bg-red-950/10 text-xs font-bold uppercase tracking-widest text-white/70">
            Indexed: <span className="text-red-400">{repositories.length}</span>
          </div>
        </div>
        <Button
          onClick={() => setIsCloneModalOpen(true)}
          className="h-12 px-6 rounded-md bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-900/40 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span className="font-bold">Connect Knowledge Source</span>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-2 bg-black rounded-md shadow-premium border-2 border-red-900/30">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input type="text" placeholder="Filter repositories..." className="w-full pl-11 pr-4 py-3 bg-transparent text-sm font-semibold text-white placeholder:text-white/30 focus:outline-none rounded-md" />
        </div>
        <div className="text-xs uppercase tracking-widest text-white/40 font-bold">Demo dataset • realistic metadata</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {repositories.map((repo, idx) => (
          <motion.div key={repo.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}>
            <Card className="group border-2 border-red-900/20 hover:border-red-600 shadow-premium bg-black rounded-md overflow-hidden">
              <div className="h-2 bg-red-600" />
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-md bg-red-600 text-white flex items-center justify-center">
                      <GitBranch className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-white">{repo.name}</CardTitle>
                      <div className="flex items-center text-xs text-white/40 font-bold uppercase tracking-widest mt-1">
                        <Globe className="w-3 h-3 mr-1" /> Public / Managed
                      </div>
                    </div>
                  </div>
                  <button className="text-white/40 hover:text-red-500"><MoreVertical className="w-5 h-5" /></button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-white/70 bg-red-950/10 border border-red-900/20 rounded-md p-3 truncate">{repo.url}</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-3 rounded-md border border-red-900/20 bg-red-950/10">
                    <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Last Commit</p>
                    <p className="text-sm text-white font-semibold mt-1">{repo.lastCommit}</p>
                    <p className="text-xs text-white/40 mt-1 flex items-center"><Calendar className="w-3 h-3 mr-1" />{repo.lastCommitAgo}</p>
                  </div>
                  <div className="p-3 rounded-md border border-red-900/20 bg-red-950/10">
                    <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Contributors</p>
                    <p className="text-sm text-white font-semibold mt-1 flex items-center"><Users className="w-4 h-4 mr-1 text-red-400" />{repo.contributors}</p>
                    <p className="text-xs text-white/50">{repo.framework} • {repo.language}</p>
                  </div>
                </div>
                <div className="p-3 rounded-md border border-red-900/20 bg-red-950/10">
                  <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Vulnerabilities</p>
                  <div className="grid grid-cols-3 gap-2 text-xs font-bold">
                    <div className="text-red-400">Critical: {repo.vulnerabilities.critical}</div>
                    <div className="text-orange-400">High: {repo.vulnerabilities.high}</div>
                    <div className="text-yellow-400">Medium: {repo.vulnerabilities.medium}</div>
                  </div>
                </div>
                <div className="p-3 rounded-md border border-red-900/20 bg-black">
                  <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">AI Summary</p>
                  <p className="text-sm text-white/70">{repo.aiSummary}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-2">Commit Activity (7d)</p>
                  <div className="grid grid-cols-7 gap-2 items-end h-16">
                    {repo.commitActivity.map((v, i) => (
                      <div key={i} className="bg-gradient-to-t from-red-800 to-red-500 rounded-t" style={{ height: `${v * 10}%` }} />
                    ))}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-red-950/10 border-t border-red-900/20 flex justify-between">
                <Button variant="ghost" className="text-red-400 hover:bg-red-900/20"><Shield className="w-4 h-4 mr-2" />Run Security Sweep</Button>
                <Button variant="ghost" className="text-red-400 hover:bg-red-900/20"><BarChart3 className="w-4 h-4 mr-2" />Open Insights</Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      <Modal isOpen={isCloneModalOpen} onClose={() => setIsCloneModalOpen(false)} title="Connect Knowledge Source">
        <div className="space-y-5">
          <p className="text-sm text-white/60">For demo mode, this action simulates cloning and indexing with production-like behavior.</p>
          <Input
            label="Repository URL"
            placeholder="https://github.com/prajwal-priyadarshan/simple_app"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
          />
          <div className="rounded-md border border-red-900/20 bg-red-950/10 p-3 text-sm text-white/70">
            Try: <span className="text-red-400">https://github.com/prajwal-priyadarshan/simple_app</span>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsCloneModalOpen(false)}>Cancel</Button>
            <Button onClick={handleConnect} isLoading={isIndexing} disabled={!repoUrl.trim()} className="bg-red-600 text-white hover:bg-red-700">
              Start Autonomous Indexing
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

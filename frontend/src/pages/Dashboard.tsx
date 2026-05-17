import { motion } from 'framer-motion';
import {
  Activity,
  GitBranch,
  Shield,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Database,
  CheckCircle2,
  BarChart3,
} from 'lucide-react';
import { Card, CardContent, Button } from '../components/ui';

const stats = [
  { label: 'Total Repositories', value: '23', icon: GitBranch, trend: '+4 this week' },
  { label: 'Indexed Repositories', value: '19', icon: Database, trend: '82.6% coverage' },
  { label: 'AI Insights', value: '146', icon: Shield, trend: '+27 today' },
  { label: 'Risk Score', value: '6.8 / 10', icon: AlertTriangle, trend: 'Moderate-High' },
  { label: 'Security Alerts', value: '8', icon: ShieldCheck, trend: '2 critical' },
  { label: 'Scan Throughput', value: '94%', icon: Activity, trend: 'Stable' },
];

const recentRepos = [
  { name: 'simple_app', commits: 14, risk: 5.2, lastScan: '12m ago', status: 'Healthy' },
  { name: 'billing-core', commits: 33, risk: 8.1, lastScan: '34m ago', status: 'Watchlist' },
  { name: 'auth-service', commits: 18, risk: 6.7, lastScan: '52m ago', status: 'Stable' },
  { name: 'mobile-client', commits: 11, risk: 4.3, lastScan: '1h ago', status: 'Healthy' },
  { name: 'infra-ops', commits: 22, risk: 7.4, lastScan: '1h ago', status: 'Watchlist' },
  { name: 'api-gateway', commits: 15, risk: 5.8, lastScan: '2h ago', status: 'Stable' },
];

const activitySeries = [58, 72, 69, 81, 76, 88, 92];

export const Dashboard = () => {
  return (
    <div className="space-y-8 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden p-8 rounded-md bg-black border-2 border-red-900/40 text-white shadow-2xl shadow-red-900/30"
      >
        <div className="absolute top-0 right-0 w-72 h-72 bg-red-600/10 blur-[90px]" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-red-900/10 blur-[90px]" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-3">RepoGuardian Command Center</h1>
            <p className="text-white/60 text-lg max-w-2xl">
              Live demo mode: cross-repository analysis, security telemetry, and autonomous indexing insights are populated with realistic operational signals.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs font-bold uppercase tracking-widest">
            <div className="px-4 py-3 rounded-md bg-red-950/20 border border-red-900/30 text-center">
              Security Posture
              <div className="text-red-400 mt-1 text-sm">B+</div>
            </div>
            <div className="px-4 py-3 rounded-md bg-red-950/20 border border-red-900/30 text-center">
              Uptime
              <div className="text-red-400 mt-1 text-sm">99.94%</div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="border-2 border-red-900/20 hover:border-red-600 transition-all duration-500 bg-black">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-md bg-red-950/20 flex items-center justify-center">
                    <stat.icon className="w-5 h-5 text-red-500" />
                  </div>
                  <span className="text-[11px] font-bold px-2 py-1 rounded bg-red-950/30 text-red-400">LIVE</span>
                </div>
                <p className="text-white/40 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                <p className="text-white text-3xl font-black mt-1">{stat.value}</p>
                <p className="text-red-400 text-xs font-semibold mt-2">{stat.trend}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border border-red-900/20 bg-black">
          <CardContent className="pt-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center"><BarChart3 className="w-6 h-6 text-red-500 mr-2" />Activity Stats</h2>
              <span className="text-xs font-bold uppercase tracking-widest text-white/40">Last 7 scans</span>
            </div>
            <div className="grid grid-cols-7 gap-3 items-end h-44">
              {activitySeries.map((value, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <div className="w-full rounded-t-md bg-gradient-to-t from-red-800 to-red-500" style={{ height: `${value}%` }} />
                  <span className="text-[10px] text-white/40 font-bold">D{idx + 1}</span>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-md border border-red-900/20 bg-red-950/10">
                <p className="text-xs text-white/40 uppercase font-bold tracking-widest">Avg Scan Duration</p>
                <p className="text-xl text-white font-bold mt-1">2m 11s</p>
              </div>
              <div className="p-4 rounded-md border border-red-900/20 bg-red-950/10">
                <p className="text-xs text-white/40 uppercase font-bold tracking-widest">Critical Findings</p>
                <p className="text-xl text-white font-bold mt-1">11</p>
              </div>
              <div className="p-4 rounded-md border border-red-900/20 bg-red-950/10">
                <p className="text-xs text-white/40 uppercase font-bold tracking-widest">Auto-Healed</p>
                <p className="text-xl text-white font-bold mt-1">7</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-red-900/20 bg-black">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold text-white mb-4">Security Metrics</h2>
            <div className="space-y-3">
              {[
                ['SAST Coverage', '96%'],
                ['Dependency Scan', 'Pass'],
                ['Secrets Exposure', '0 leaks'],
                ['Policy Compliance', '91%'],
                ['MTTR', '3h 24m'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between p-3 rounded-md border border-red-900/20 bg-red-950/10">
                  <span className="text-sm text-white/70 font-medium">{label}</span>
                  <span className="text-sm text-red-400 font-bold">{value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-red-900/20 bg-black">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl font-bold text-white">Repository Activity</h2>
            <Button variant="ghost" className="text-red-500 hover:bg-red-950/20 font-bold">View Full Timeline</Button>
          </div>
          <div className="space-y-3">
            {recentRepos.map((repo, i) => (
              <motion.div key={repo.name} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }} className="p-4 rounded-md border border-red-900/20 bg-red-950/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-md bg-black border border-red-900/30 flex items-center justify-center">
                    <GitBranch className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-white font-bold">{repo.name}</p>
                    <p className="text-xs text-white/40 font-medium flex items-center"><Clock className="w-3 h-3 mr-1" />Scanned {repo.lastScan}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-6 text-right">
                  <div>
                    <p className="text-[10px] text-white/40 uppercase font-bold">Commits</p>
                    <p className="text-white font-bold">{repo.commits}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-white/40 uppercase font-bold">Risk</p>
                    <p className="text-red-400 font-bold">{repo.risk}</p>
                  </div>
                  <div className="flex items-center justify-end text-green-400 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 mr-1" />{repo.status}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

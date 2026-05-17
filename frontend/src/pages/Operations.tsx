import { motion } from 'framer-motion';
import { Activity, CheckCircle2, AlertTriangle, RefreshCw, Server, Shield, GitBranch, Clock, Database } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui';

const activeScans = [
  { repo: 'simple_app', stage: 'Dependency graph build', progress: 86, eta: '48s' },
  { repo: 'billing_core', stage: 'Security ruleset evaluation', progress: 57, eta: '1m 22s' },
  { repo: 'auth_service', stage: 'Semantic embedding refresh', progress: 41, eta: '2m 09s' },
];

const pipeline = [
  { name: 'Build & Test', status: 'Passed', latency: '4m 12s' },
  { name: 'Container Scan', status: 'Passed', latency: '1m 41s' },
  { name: 'Deploy Staging', status: 'In Progress', latency: '2m 03s' },
  { name: 'Canary Analysis', status: 'Queued', latency: '-' },
];

const syncLogs = [
  '19:42 • simple_app • Pull successful • 4 files changed',
  '19:39 • auth_service • Graph rebuild complete • 2 warnings',
  '19:37 • billing_core • Dependency lock updated',
  '19:31 • infra_ops • Drift monitor triggered rollback simulation',
  '19:25 • mobile_client • Index cache refreshed',
];

const securityEvents = [
  { severity: 'high', text: 'Potential JWT validation bypass pattern detected in auth middleware' },
  { severity: 'medium', text: 'Outdated http package found in flutter dependencies' },
  { severity: 'low', text: 'Debug logs expose internal route names in staging build' },
];

const topStats = [
  { label: 'Active Scans', value: '7', icon: Activity },
  { label: 'Deployment Health', value: '98.7%', icon: Server },
  { label: 'Pipeline Success', value: '31/34', icon: GitBranch },
  { label: 'Security Signals', value: '14', icon: Shield },
];

export const Operations = () => {
  return (
    <div className="space-y-8 pb-12">
      <div className="p-8 bg-black border border-red-900/30 rounded-md">
        <h1 className="text-3xl text-white font-bold">Operations Command Board</h1>
        <p className="text-white/60 mt-2">Demo telemetry for scans, deployment lifecycle, sync orchestration, and security monitoring.</p>
      </div>

      <div className="grid xl:grid-cols-4 md:grid-cols-2 gap-6">
        {topStats.map((item, i) => (
          <motion.div key={item.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className="border border-red-900/20 bg-black">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-3">
                  <item.icon className="w-5 h-5 text-red-500" />
                  <span className="text-[10px] uppercase tracking-widest text-white/40">Live</span>
                </div>
                <p className="text-xs uppercase tracking-widest text-white/40 font-bold">{item.label}</p>
                <p className="text-3xl text-white font-black mt-1">{item.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="border border-red-900/20 bg-black">
          <CardHeader>
            <CardTitle>Active Scan Queue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeScans.map((scan) => (
              <div key={scan.repo} className="p-4 rounded-md border border-red-900/20 bg-red-950/10">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-white font-bold">{scan.repo}</p>
                  <p className="text-xs text-white/40 uppercase font-bold">ETA {scan.eta}</p>
                </div>
                <p className="text-sm text-white/60 mb-3">{scan.stage}</p>
                <div className="w-full h-2 bg-black rounded">
                  <div className="h-2 bg-gradient-to-r from-red-700 to-red-500 rounded" style={{ width: `${scan.progress}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-red-900/20 bg-black">
          <CardHeader>
            <CardTitle>CI/CD Pipeline Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pipeline.map((item) => (
              <div key={item.name} className="p-4 rounded-md border border-red-900/20 bg-red-950/10 flex items-center justify-between">
                <div>
                  <p className="text-white font-bold">{item.name}</p>
                  <p className="text-xs text-white/50">Duration: {item.latency}</p>
                </div>
                <div className="text-sm font-bold flex items-center">
                  {item.status === 'Passed' && <CheckCircle2 className="w-4 h-4 text-green-400 mr-1" />}
                  {item.status === 'In Progress' && <RefreshCw className="w-4 h-4 text-yellow-400 mr-1 animate-spin" />}
                  {item.status === 'Queued' && <Clock className="w-4 h-4 text-white/40 mr-1" />}
                  <span className="text-white/80">{item.status}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="border border-red-900/20 bg-black">
          <CardHeader>
            <CardTitle className="flex items-center"><Database className="w-5 h-5 mr-2 text-red-500" />Repository Sync Logs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {syncLogs.map((log) => (
              <div key={log} className="text-sm text-white/70 p-3 rounded-md bg-red-950/10 border border-red-900/20">{log}</div>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-red-900/20 bg-black">
          <CardHeader>
            <CardTitle className="flex items-center"><Shield className="w-5 h-5 mr-2 text-red-500" />Security Monitoring Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {securityEvents.map((event) => (
              <div key={event.text} className="p-4 rounded-md border border-red-900/20 bg-red-950/10">
                <p className="text-xs uppercase tracking-widest font-bold text-red-400 mb-1">{event.severity}</p>
                <p className="text-sm text-white/80">{event.text}</p>
              </div>
            ))}
            <Button className="w-full bg-red-600 text-white hover:bg-red-700">
              <AlertTriangle className="w-4 h-4 mr-2" />Investigate Active Alerts
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

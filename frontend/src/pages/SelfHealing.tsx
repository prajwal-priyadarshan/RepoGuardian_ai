import { motion } from 'framer-motion';
import { Wrench, ShieldCheck, RefreshCw, FileCheck2, Package, Terminal, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui';

const fixes = [
  { item: 'Refactor duplicate scramble function into shared utility', status: 'Applied', impact: 'High' },
  { item: 'Patch vulnerable http dependency to secure version', status: 'Patched', impact: 'Critical' },
  { item: 'Add null-check guard in timer callback', status: 'Applied', impact: 'Medium' },
  { item: 'Stabilize score persistence write order', status: 'Queued', impact: 'Medium' },
];

const logs = [
  '20:02:11 • Auto-fix generated for scramble_service.dart',
  '20:02:21 • Dependency patch simulated: http 0.13.5 -> 1.2.1',
  '20:02:34 • Recovery checkpoint saved: pre_heal_snapshot_041',
  '20:02:46 • Validation suite completed (14/14 pass)',
  '20:03:01 • Runtime smoke test passed on demo profile',
];

export const SelfHealing = () => {
  return (
    <div className="space-y-8 pb-12">
      <div className="p-8 bg-black border border-red-900/30 rounded-md">
        <div className="flex items-center gap-4 mb-3">
          <Wrench className="w-8 h-8 text-red-500" />
          <h1 className="text-3xl text-white font-bold">Autonomous Self-Healing</h1>
        </div>
        <p className="text-white/60">Demo mode simulating auto-remediation workflow with repair logs and validation status.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border border-red-900/20 bg-black"><CardContent className="pt-6"><p className="text-xs uppercase text-white/40 font-bold">Fixes Suggested</p><p className="text-3xl text-white font-black mt-1">12</p></CardContent></Card>
        <Card className="border border-red-900/20 bg-black"><CardContent className="pt-6"><p className="text-xs uppercase text-white/40 font-bold">Auto Applied</p><p className="text-3xl text-white font-black mt-1">7</p></CardContent></Card>
        <Card className="border border-red-900/20 bg-black"><CardContent className="pt-6"><p className="text-xs uppercase text-white/40 font-bold">Patch Safety</p><p className="text-3xl text-green-400 font-black mt-1">95%</p></CardContent></Card>
        <Card className="border border-red-900/20 bg-black"><CardContent className="pt-6"><p className="text-xs uppercase text-white/40 font-bold">Recovery State</p><p className="text-3xl text-white font-black mt-1">Ready</p></CardContent></Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="border border-red-900/20 bg-black">
          <CardHeader><CardTitle className="flex items-center"><FileCheck2 className="w-5 h-5 mr-2 text-red-500" />Auto-fix Suggestions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {fixes.map((fix) => (
              <motion.div key={fix.item} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-4 rounded-md border border-red-900/20 bg-red-950/10 flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-white/80">{fix.item}</p>
                  <p className="text-xs text-white/40 mt-1">Impact: {fix.impact}</p>
                </div>
                <span className="text-xs font-bold text-red-400 uppercase">{fix.status}</span>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-red-900/20 bg-black">
          <CardHeader><CardTitle className="flex items-center"><Package className="w-5 h-5 mr-2 text-red-500" />Dependency Repair & Patch Simulation</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-md border border-red-900/20 bg-red-950/10 text-sm text-white/80">
              Vulnerability patch simulation completed for 3 dependency chains. Rollback checkpoint preserved for fast restore.
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-md border border-red-900/20 bg-black text-center"><p className="text-xs text-white/40 uppercase">Patched Packages</p><p className="text-white font-bold">3</p></div>
              <div className="p-3 rounded-md border border-red-900/20 bg-black text-center"><p className="text-xs text-white/40 uppercase">Rollback Points</p><p className="text-white font-bold">2</p></div>
            </div>
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white"><RefreshCw className="w-4 h-4 mr-2" />Run Recovery Drill</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-red-900/20 bg-black">
        <CardHeader><CardTitle className="flex items-center"><Terminal className="w-5 h-5 mr-2 text-red-500" />Recovery Logs & Status Indicators</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {logs.map((log) => (
            <div key={log} className="p-3 rounded-md border border-red-900/20 bg-red-950/10 text-sm text-white/75">{log}</div>
          ))}
          <div className="grid md:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-md border border-red-900/20 bg-black flex items-center text-sm text-green-400 font-bold"><CheckCircle2 className="w-4 h-4 mr-2" />Validation Passed</div>
            <div className="p-3 rounded-md border border-red-900/20 bg-black flex items-center text-sm text-yellow-400 font-bold"><AlertCircle className="w-4 h-4 mr-2" />1 Manual Review</div>
            <div className="p-3 rounded-md border border-red-900/20 bg-black flex items-center text-sm text-green-400 font-bold"><ShieldCheck className="w-4 h-4 mr-2" />System Stable</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

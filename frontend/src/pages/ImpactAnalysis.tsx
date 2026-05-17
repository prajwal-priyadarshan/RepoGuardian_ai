import { AlertTriangle, Network, Gauge, ShieldAlert, ArrowRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui';

const affected = [
  { area: 'Word scramble engine', files: 6, impact: 'High' },
  { area: 'Timer/state manager', files: 4, impact: 'Medium' },
  { area: 'UI animation widgets', files: 3, impact: 'Low' },
  { area: 'Scoring persistence', files: 2, impact: 'Medium' },
];

const mitigations = [
  'Add regression tests for scramble output consistency',
  'Introduce feature flag for new timer strategy rollout',
  'Run performance benchmark on lower-end Android devices',
  'Pin flutter_lints and analyzer to avoid CI drift',
];

export const ImpactAnalysis = () => {
  return (
    <div className="space-y-8 pb-12">
      <div className="p-8 bg-black border border-red-900/30 rounded-md">
        <h1 className="text-3xl text-white font-bold">Impact & Risk Assessment</h1>
        <p className="text-white/60 mt-2">Realistic mock impact report for demo presentation.</p>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border border-red-900/20 bg-black"><CardContent className="pt-6"><p className="text-xs text-white/40 uppercase font-bold">Risk Level</p><p className="text-3xl text-red-400 font-black mt-1">Medium</p></CardContent></Card>
        <Card className="border border-red-900/20 bg-black"><CardContent className="pt-6"><p className="text-xs text-white/40 uppercase font-bold">Affected Files</p><p className="text-3xl text-white font-black mt-1">15</p></CardContent></Card>
        <Card className="border border-red-900/20 bg-black"><CardContent className="pt-6"><p className="text-xs text-white/40 uppercase font-bold">Dependency Impact</p><p className="text-3xl text-white font-black mt-1">Moderate</p></CardContent></Card>
        <Card className="border border-red-900/20 bg-black"><CardContent className="pt-6"><p className="text-xs text-white/40 uppercase font-bold">Perf Impact</p><p className="text-3xl text-white font-black mt-1">+8ms</p></CardContent></Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="border border-red-900/20 bg-black">
          <CardHeader><CardTitle className="flex items-center"><Network className="w-5 h-5 text-red-500 mr-2" />Dependency Impact Matrix</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {affected.map((row) => (
              <div key={row.area} className="p-4 rounded-md border border-red-900/20 bg-red-950/10 flex justify-between items-center">
                <div>
                  <p className="text-white font-semibold">{row.area}</p>
                  <p className="text-xs text-white/50">Estimated files impacted: {row.files}</p>
                </div>
                <span className="text-sm text-red-400 font-bold">{row.impact}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-red-900/20 bg-black">
          <CardHeader><CardTitle className="flex items-center"><Gauge className="w-5 h-5 text-red-500 mr-2" />Performance Impact</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-md border border-red-900/20 bg-red-950/10">
              <p className="text-sm text-white/75">Render path adds measurable overhead in animation-heavy screens. The estimated median frame cost increase is <span className="text-red-400 font-bold">+8ms</span> on low-end devices.</p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-md bg-red-950/10 border border-red-900/20"><p className="text-xs text-white/40 uppercase">CPU</p><p className="text-white font-bold">+4%</p></div>
              <div className="p-3 rounded-md bg-red-950/10 border border-red-900/20"><p className="text-xs text-white/40 uppercase">Memory</p><p className="text-white font-bold">+9MB</p></div>
              <div className="p-3 rounded-md bg-red-950/10 border border-red-900/20"><p className="text-xs text-white/40 uppercase">Frame Jank</p><p className="text-white font-bold">1.7%</p></div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-red-900/20 bg-black">
        <CardHeader><CardTitle className="flex items-center"><ShieldAlert className="w-5 h-5 text-red-500 mr-2" />Suggested Mitigation Steps</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {mitigations.map((step) => (
            <div key={step} className="p-3 rounded-md border border-red-900/20 bg-red-950/10 text-sm text-white/80">{step}</div>
          ))}
          <Button className="bg-red-600 hover:bg-red-700 text-white"><AlertTriangle className="w-4 h-4 mr-2" />Generate Mitigation Plan <ArrowRight className="w-4 h-4 ml-2" /></Button>
        </CardContent>
      </Card>
    </div>
  );
};

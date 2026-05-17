import { motion } from 'framer-motion';
import { Brain, Layers, ShieldCheck, Wrench, Package, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '../components/ui';

const aiSections = [
  {
    title: 'Repository Overview',
    body: 'simple_app is a compact Flutter project focused on a word-scramble gameplay loop. The repository has clear separation between UI widgets, game logic, and persistence helpers, making maintenance predictable for a small team.',
  },
  {
    title: 'Tech Stack Detection',
    body: 'Framework: Flutter. Language: Dart. Tooling indicates standard pubspec dependency management, Material UI components, and a lightweight state-handling pattern suitable for interactive mini-games.',
  },
  {
    title: 'Code Quality Analysis',
    body: 'Code readability is strong with descriptive widget names and organized folders. Main concern is duplicated string manipulation logic in two utility files, which can be consolidated into a single service.',
  },
  {
    title: 'Security Observations',
    body: 'No critical security exposure observed. One medium-risk finding: external dictionary source is not version-pinned, which could cause non-deterministic behavior in builds.',
  },
  {
    title: 'Dependency Analysis',
    body: 'Dependency graph is shallow and healthy. Recommended update path: lock flutter_lints and shared_preferences minor versions to stabilize CI and prevent unexpected warnings.',
  },
  {
    title: 'Suggested Improvements',
    body: '1) Extract scramble algorithm into a tested core module. 2) Add integration tests for timer + score state transitions. 3) Add structured analytics events for daily challenge completion.',
  },
];

const qualityScores = [
  ['Maintainability', 84],
  ['Test Coverage', 68],
  ['Security Hygiene', 79],
  ['Dependency Health', 82],
  ['Performance Readiness', 74],
];

export const AIAnalysis = () => {
  return (
    <div className="space-y-8 pb-12">
      <div className="p-8 bg-black border border-red-900/30 rounded-md">
        <div className="flex items-center gap-4 mb-3">
          <Brain className="w-8 h-8 text-red-500" />
          <h1 className="text-3xl text-white font-bold">AI Analysis • Demo Intelligence Report</h1>
        </div>
        <p className="text-white/60">Meaningful, human-readable analysis generated for demo walkthroughs.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="border border-red-900/20 bg-black"><CardContent className="pt-6"><p className="text-xs uppercase text-white/40 font-bold">Overall Confidence</p><p className="text-3xl text-white font-black mt-1">91%</p></CardContent></Card>
        <Card className="border border-red-900/20 bg-black"><CardContent className="pt-6"><p className="text-xs uppercase text-white/40 font-bold">Primary Stack</p><p className="text-3xl text-white font-black mt-1">Flutter/Dart</p></CardContent></Card>
        <Card className="border border-red-900/20 bg-black"><CardContent className="pt-6"><p className="text-xs uppercase text-white/40 font-bold">Actionable Suggestions</p><p className="text-3xl text-white font-black mt-1">9</p></CardContent></Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-5">
          {aiSections.map((section, idx) => (
            <motion.div key={section.title} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}>
              <Card className="border border-red-900/20 bg-black">
                <CardHeader>
                  <CardTitle className="text-white">{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white/75 leading-relaxed">{section.body}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="space-y-6">
          <Card className="border border-red-900/20 bg-black">
            <CardHeader>
              <CardTitle className="flex items-center"><Layers className="w-5 h-5 mr-2 text-red-500" />Quality Scores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {qualityScores.map(([label, score]) => (
                <div key={String(label)}>
                  <div className="flex justify-between text-sm mb-1"><span className="text-white/70">{label}</span><span className="text-red-400 font-bold">{score}%</span></div>
                  <div className="w-full h-2 bg-black rounded"><div className="h-2 bg-gradient-to-r from-red-800 to-red-500 rounded" style={{ width: `${score}%` }} /></div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-red-900/20 bg-black">
            <CardHeader>
              <CardTitle className="flex items-center"><ShieldCheck className="w-5 h-5 mr-2 text-red-500" />Top Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                'Lock dependency versions in pubspec.yaml',
                'Add algorithm unit tests for scramble edge cases',
                'Create CI lint gate for analyzer warnings',
                'Move duplicate utility logic into shared service',
              ].map((item) => (
                <div key={item} className="text-sm text-white/75 p-3 rounded-md border border-red-900/20 bg-red-950/10 flex items-start">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-red-400 mt-0.5" />{item}
                </div>
              ))}
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white"><Sparkles className="w-4 h-4 mr-2" />Generate Improvement Plan</Button>
            </CardContent>
          </Card>

          <Card className="border border-red-900/20 bg-black">
            <CardContent className="pt-6 text-sm text-white/70 space-y-2">
              <p className="flex items-center"><Package className="w-4 h-4 mr-2 text-red-500" />Dependency drift risk: Moderate</p>
              <p className="flex items-center"><Wrench className="w-4 h-4 mr-2 text-red-500" />Estimated refactor effort: 2-3 days</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

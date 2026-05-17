import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ExternalLink, Database, FileCode, Sparkles, Info } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button } from '../components/ui';

type DemoResult = {
  file: string;
  score: number;
  snippet: string;
  symbol: string;
  lines: string;
};

const defaultResults: DemoResult[] = [
  {
    file: 'lib/main.dart',
    score: 0.9342,
    symbol: 'MyApp',
    lines: '1-74',
    snippet: 'void main() => runApp(const MyApp());\n\nclass MyApp extends StatelessWidget { ... }',
  },
  {
    file: 'lib/game/scrambler.dart',
    score: 0.9011,
    symbol: 'ScramblerService',
    lines: '8-63',
    snippet: 'String scrambleWord(String input) {\n  final chars = input.split(\'\');\n  chars.shuffle();\n  return chars.join();\n}',
  },
];

export const CodeSearch = () => {
  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const normalized = submitted.trim().toLowerCase();
  const isRepoQuestion = normalized === 'what is this repo?' || normalized === 'what is this repo';

  const results = useMemo(() => {
    if (!submitted) return [];
    if (isRepoQuestion) {
      return [
        {
          file: 'lib/game/word_screen.dart',
          score: 0.9721,
          symbol: 'WordScreen',
          lines: '12-118',
          snippet: 'This screen presents scrambled words to the player and validates user attempts with timer-based scoring.',
        },
        {
          file: 'lib/game/scrambler.dart',
          score: 0.9544,
          symbol: 'ScramblerService',
          lines: '8-63',
          snippet: 'Core scramble logic that randomizes letter order and preserves word-length constraints for gameplay fairness.',
        },
      ] as DemoResult[];
    }
    return defaultResults;
  }, [submitted, isRepoQuestion]);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 600));
    setSubmitted(query);
    setIsLoading(false);
  };

  return (
    <div className="space-y-8 pb-12">
      <div className="p-8 bg-black border-2 border-red-900/40 rounded-md shadow-premium">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-black text-white tracking-tight mb-2">Semantic Code Search</h1>
            <p className="text-white/60 font-medium">Demo mode with deterministic, realistic semantic retrieval.</p>
          </div>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Try: What is this repo?"
                className="w-full pl-12 pr-4 py-4 bg-red-950/10 border border-red-900/30 rounded-md text-white"
              />
            </div>
            <Button onClick={handleSearch} isLoading={isLoading} className="bg-red-600 hover:bg-red-700 text-white px-8">
              <Sparkles className="w-4 h-4 mr-2" />Search
            </Button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!submitted ? (
          <div className="py-24 text-center bg-black border border-red-900/20 border-dashed rounded-md flex flex-col items-center">
            <Database className="w-10 h-10 text-white/20 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Search Ready</h3>
            <p className="text-white/40">Ask any natural-language question about the repository.</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <Card className="border border-red-900/20 bg-black">
              <CardHeader>
                <CardTitle className="flex items-center text-white"><Info className="w-5 h-5 text-red-500 mr-2" />Answer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isRepoQuestion ? (
                  <>
                    <p className="text-white text-lg font-semibold">This is a simple Flutter application that scrambles words.</p>
                    <div className="grid md:grid-cols-3 gap-3">
                      <div className="p-3 rounded-md border border-red-900/20 bg-red-950/10"><p className="text-xs text-white/40 uppercase">Framework</p><p className="text-white font-bold">Flutter</p></div>
                      <div className="p-3 rounded-md border border-red-900/20 bg-red-950/10"><p className="text-xs text-white/40 uppercase">Language</p><p className="text-white font-bold">Dart</p></div>
                      <div className="p-3 rounded-md border border-red-900/20 bg-red-950/10"><p className="text-xs text-white/40 uppercase">Project Type</p><p className="text-white font-bold">Word Game</p></div>
                    </div>
                    <p className="text-white/70 text-sm">Basic summary: The app presents scrambled words to users, validates guesses, tracks score/time, and supports replay sessions with simple local-state persistence.</p>
                  </>
                ) : (
                  <p className="text-white/80">Semantic matches found for: <span className="text-red-400 font-bold">{submitted}</span></p>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-5">
              {results.map((res, i) => (
                <motion.div key={res.file} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="border border-red-900/20 bg-black">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-white flex items-center"><FileCode className="w-5 h-5 mr-2 text-red-500" />{res.file}</CardTitle>
                        <span className="text-xs text-red-400 font-bold">Score {res.score.toFixed(4)}</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-white/40 uppercase tracking-widest mb-2">Symbol: {res.symbol} • Lines {res.lines}</p>
                      <div className="p-4 rounded-md border border-red-900/20 bg-red-950/10 text-sm text-white/80 font-mono whitespace-pre-wrap">{res.snippet}</div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="ghost" className="text-red-400 hover:bg-red-900/20">Open Source <ExternalLink className="w-4 h-4 ml-2" /></Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, FileText, GitBranch, Database, Sparkles, Code2 } from 'lucide-react';
import { Card, CardContent, Button } from '../components/ui';
import { selectCurrentRepo, useAppStore } from '../store/useAppStore';
import { getDisplayName } from '../lib/utils';
import { useSearchCode } from '../hooks/useAPI';

export const CodeSearch = () => {
  const currentRepo = useAppStore(selectCurrentRepo);
  const searchResults = useAppStore((state) => state.searchResults);
  const [query, setQuery] = useState('');
  const searchMutation = useSearchCode();

  const handleSearch = async () => {
    if (!currentRepo) {
      return;
    }

    const searchText = query.trim();
    if (!searchText) {
      return;
    }

    try {
      await searchMutation.mutateAsync({ repo_id: currentRepo.id, query: searchText });
    } catch (error) {
      console.error(error);
    }
  };

  const results = searchResults?.results ?? [];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 border-red-900/20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-md bg-red-950/20 flex items-center justify-center">
                <Search className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Code Search</h1>
                <p className="text-white/50">Search the indexed repository content using the live embedding backend.</p>
              </div>
            </div>
            <p className="text-white/40">{currentRepo ? getDisplayName(currentRepo) : 'No repository selected'}</p>
          </div>
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search code, files, symbols..."
              className="h-12 w-full lg:w-96 rounded-md bg-black/40 border border-white/10 text-white px-4 outline-none focus:border-red-600 transition-colors"
            />
            <Button onClick={handleSearch} className="bg-red-600 text-white hover:bg-red-700" disabled={!currentRepo || !query.trim()}>
              <Sparkles className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border border-red-900/20 bg-black">
          <CardContent className="pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white flex items-center"><Database className="w-6 h-6 text-red-500 mr-2" />Search Results</h2>
              <span className="text-xs font-bold uppercase tracking-widest text-white/40">{results.length} hits</span>
            </div>

            {results.length > 0 ? results.map((result, index) => (
              <motion.div
                key={`${result.id}-${index}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="p-4 rounded-md border border-red-900/20 bg-red-950/10"
              >
                <div className="flex items-center justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-red-500" />
                    <h3 className="text-white font-semibold">{result.metadata.file_path}</h3>
                  </div>
                  <span className="text-xs text-white/40 uppercase tracking-wider">Score {result.score.toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/40 mb-2">
                  <GitBranch className="w-3.5 h-3.5" />
                  <span>{result.metadata.function_name || 'Unknown function'}</span>
                </div>
                <p className="text-white/70 leading-relaxed text-sm whitespace-pre-wrap">{result.metadata.code}</p>
              </motion.div>
            )) : (
              <div className="p-4 rounded-md border border-red-900/20 bg-red-950/10 text-white/60">Search results will appear here after querying the active repository.</div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-red-900/20 bg-black">
          <CardContent className="pt-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center"><Code2 className="w-5 h-5 text-red-500 mr-2" />Search Controls</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-md border border-red-900/20 bg-red-950/10">
                <span className="text-sm text-white/70 font-medium">Repository</span>
                <span className="text-sm text-red-400 font-bold">{currentRepo ? getDisplayName(currentRepo) : 'None'}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-md border border-red-900/20 bg-red-950/10">
                <span className="text-sm text-white/70 font-medium">Result Count</span>
                <span className="text-sm text-red-400 font-bold">{results.length}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-md border border-red-900/20 bg-red-950/10">
                <span className="text-sm text-white/70 font-medium">Backend</span>
                <span className="text-sm text-red-400 font-bold">Embeddings</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

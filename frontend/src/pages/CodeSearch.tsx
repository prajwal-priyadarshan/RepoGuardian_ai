import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ChevronRight, 
  Maximize2, 
  ExternalLink, 
  Database,
  Terminal,
  FileCode,
  Sparkles
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Button,
  LoadingSpinner,
} from '../components/ui';
import { useAppStore } from '../store/useAppStore';
import { useSearchCode } from '../hooks/useAPI';

export const CodeSearch = () => {
  const { repositories, searchResults } = useAppStore();
  const [selectedRepoId, setSelectedRepoId] = useState('');
  const [query, setQuery] = useState('');
  const searchMutation = useSearchCode();

  const handleSearch = async () => {
    if (!selectedRepoId || !query.trim()) return;
    await searchMutation.mutateAsync({
      repo_id: selectedRepoId,
      query: query,
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Search Command Header */}
      <div className="p-8 glass-card border-none bg-white">
        <div className="max-w-4xl mx-auto space-y-8">
           <div className="text-center">
              <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Semantic Knowledge Retrieval</h1>
              <p className="text-slate-500 font-medium text-lg italic">Explore your codebase using natural language and high-dimension Gemini vectors.</p>
           </div>
           
           <div className="flex flex-col space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Ask anything (e.g., 'How is the user authentication handled?')"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-14 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-medium focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                     <span className="text-[10px] font-black text-slate-300 bg-slate-100 px-2 py-1 rounded">ENTER ↵</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between px-2">
                 <div className="flex items-center space-x-4">
                    <select
                      value={selectedRepoId}
                      onChange={(e) => setSelectedRepoId(e.target.value)}
                      className="bg-transparent text-slate-900 text-xs font-black uppercase tracking-widest focus:outline-none cursor-pointer hover:text-blue-600 transition-colors"
                    >
                      <option value="">Select Knowledge Base</option>
                      {repositories.map((repo) => (
                        <option key={repo.id} value={repo.id}>
                          {repo.name}
                        </option>
                      ))}
                    </select>
                 </div>
                 <Button
                    onClick={handleSearch}
                    isLoading={searchMutation.isPending}
                    disabled={!selectedRepoId || !query.trim()}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold h-11 px-8 rounded-xl shadow-lg active:scale-95 transition-all flex items-center"
                 >
                    <Sparkles className="w-4 h-4 mr-2 text-blue-400" />
                    Query Vector DB
                 </Button>
              </div>
           </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {searchMutation.isPending ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-32 flex flex-col items-center justify-center space-y-8"
          >
            <div className="relative w-32 h-32 flex items-center justify-center">
               <div className="absolute inset-0 border-4 border-blue-100 rounded-full animate-ping opacity-20" />
               <Database className="w-12 h-12 text-blue-600 animate-pulse" />
            </div>
            <div className="text-center">
               <h3 className="text-xl font-bold text-slate-900 leading-none mb-2">Calculating Vector Similarities</h3>
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest italic">Gemini 1.5 Text Embeddings (3072 dims)</p>
            </div>
          </motion.div>
        ) : searchResults && searchResults.results?.length > 0 ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="flex items-center justify-between px-2">
               <h2 className="text-2xl font-bold text-slate-900">Search Results</h2>
               <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                  Found {searchResults.results.length} matches
               </p>
            </div>

            <div className="grid gap-6">
               {searchResults.results.map((result, i) => (
                 <motion.div
                   key={i}
                   initial={{ opacity: 0, x: -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   transition={{ delay: i * 0.1 }}
                 >
                   <Card className="border-none shadow-premium bg-white group hover:shadow-2xl transition-all duration-300 overflow-hidden">
                      <div className="h-1 bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardHeader className="p-6 pb-2 border-b border-slate-50">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                               <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                  <FileCode className="w-5 h-5" />
                               </div>
                               <div>
                                  <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                     {result.metadata.file_path || 'Unknown File'}
                                  </CardTitle>
                                  <div className="flex items-center space-x-3 mt-1">
                                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">
                                        Score: {result.score?.toFixed(4) || '0.000'}
                                     </span>
                                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">
                                        Function: {result.metadata.function_name || 'Global'}
                                     </span>
                                  </div>
                               </div>
                            </div>
                            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-900 rounded-lg">
                               <Maximize2 className="w-4 h-4" />
                            </Button>
                         </div>
                      </CardHeader>
                      <CardContent className="p-0">
                         <div className="bg-slate-900 p-6 font-mono text-sm leading-relaxed text-slate-300 relative">
                            <div className="absolute top-2 right-4 text-[10px] font-black text-slate-700 tracking-widest uppercase">Content Context</div>
                            <code className="block whitespace-pre-wrap">{result.metadata.code}</code>
                         </div>
                      </CardContent>
                      <CardFooter className="bg-slate-50 p-4 border-t border-slate-100 flex justify-between items-center">
                         <div className="flex items-center space-x-4 text-xs font-bold text-slate-500">
                            <Terminal className="w-3.5 h-3.5 mr-2" />
                            Lines: {result.metadata.line_start || '?'}-{result.metadata.line_end || '?'}
                         </div>
                         <Button variant="ghost" size="sm" className="text-blue-600 font-bold hover:bg-blue-100 rounded-lg">
                            Go to source <ExternalLink className="ml-2 w-3.5 h-3.5" />
                         </Button>
                      </CardFooter>
                   </Card>
                 </motion.div>
               ))}
            </div>
          </motion.div>
        ) : (
          <div className="py-24 text-center glass-card border-dashed flex flex-col items-center">
             <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mb-6">
                <Search className="w-10 h-10 text-slate-300" />
             </div>
             <h3 className="text-xl font-bold text-slate-900 mb-2">Search Base Ready</h3>
             <p className="text-slate-500 max-w-md mx-auto font-medium leading-relaxed">
               Ask questions about your codebase in plain English. The AI will traverse its high-dimension vector database to find relevant structural context.
             </p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

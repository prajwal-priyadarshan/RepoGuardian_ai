import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FolderGit2, 
  Upload, 
  RefreshCw, 
  Trash2, 
  GitBranch, 
  Calendar, 
  Plus, 
  Search, 
  Globe,
  Lock,
  MoreVertical
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Button,
  Input,
  Modal,
  LoadingSpinner,
} from '../components/ui';
import { useAppStore } from '../store/useAppStore';
import { useCloneRepo, useUploadRepo, useSyncRepo } from '../hooks/useAPI';

export const Repositories = () => {
  const { repositories, isLoading } = useAppStore();
  const [isCloneModalOpen, setIsCloneModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [repoUrl, setRepoUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const cloneMutation = useCloneRepo();
  const uploadMutation = useUploadRepo();
  const syncMutation = useSyncRepo();

  const handleClone = async () => {
    if (!repoUrl.trim()) return;
    await cloneMutation.mutateAsync({ repo_url: repoUrl });
    setRepoUrl('');
    setIsCloneModalOpen(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    await uploadMutation.mutateAsync(selectedFile);
    setSelectedFile(null);
    setIsUploadModalOpen(false);
  };

  const handleSync = async (repoId: string) => {
    await syncMutation.mutateAsync(repoId);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 leading-tight">Code Intelligence Base</h1>
          <p className="text-slate-500 mt-2 font-medium">
            Manage and index your repositories for deep AI architectural analysis.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={() => setIsCloneModalOpen(true)}
            className="h-12 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100 flex items-center space-x-2 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span className="font-bold">Connect GitHub</span>
          </Button>
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            variant="outline"
            className="h-12 px-6 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center space-x-2 transition-all active:scale-95"
          >
            <Upload className="w-4 h-4" />
            <span className="font-bold">Upload Local</span>
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-2 bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Filter indexed repositories..." 
            className="w-full pl-11 pr-4 py-3 bg-transparent text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none"
          />
        </div>
        <div className="flex space-x-2 px-2">
           <button className="px-4 py-2 text-xs font-bold text-blue-600 bg-blue-50 rounded-lg">All</button>
           <button className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">GitHub</button>
           <button className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">Local</button>
        </div>
      </div>

      {/* Repositories Grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Accessing Knowledge Base...</p>
        </div>
      ) : repositories.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="border-2 border-dashed border-slate-200 shadow-none bg-slate-50/50">
            <CardContent className="text-center py-20">
              <div className="w-20 h-20 bg-white rounded-3xl shadow-sm flex items-center justify-center mx-auto mb-6">
                <FolderGit2 className="w-10 h-10 text-slate-300" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No Repositories Indexed</h3>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto font-medium">
                Your AI guardian needs code to analyze. Connect your first repository to begin building your structural knowledge base.
              </p>
              <div className="flex justify-center space-x-4">
                <Button onClick={() => setIsCloneModalOpen(true)} className="rounded-xl h-12 px-8 font-bold">
                  Clone Now
                </Button>
                <Button variant="outline" onClick={() => setIsUploadModalOpen(true)} className="rounded-xl h-12 px-8 font-bold">
                  Upload ZIP
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {repositories.map((repo, index) => (
            <motion.div
              key={repo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group border-none shadow-premium hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden bg-white">
                <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${repo.source === 'github' ? 'bg-slate-900 text-white' : 'bg-blue-50 text-blue-600'}`}>
                        {repo.source === 'github' ? (
                          <GitBranch className="w-6 h-6" />
                        ) : (
                          <Upload className="w-6 h-6" />
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <CardTitle className="text-lg font-bold text-slate-900 truncate leading-none mb-2">{repo.name}</CardTitle>
                        <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-widest text-slate-400">
                           {repo.source === 'github' ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                           <span>{repo.source === 'github' ? 'Public / Managed' : 'Private / Local'}</span>
                        </div>
                      </div>
                    </div>
                    <button className="text-slate-300 hover:text-slate-600 transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </CardHeader>
                <CardContent className="pb-6">
                  <div className="space-y-4">
                    {repo.url && (
                       <p className="text-sm font-medium text-slate-500 truncate bg-slate-50 p-2 rounded-lg border border-slate-100">{repo.url}</p>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Added</p>
                        <div className="flex items-center text-sm font-bold text-slate-700">
                          <Calendar className="w-3.5 h-3.5 mr-2 text-slate-400" />
                          {new Date(repo.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Last Sync</p>
                        <div className="flex items-center text-sm font-bold text-slate-700">
                          <RefreshCw className="w-3.5 h-3.5 mr-2 text-slate-400" />
                          {repo.lastSynced ? new Date(repo.lastSynced).toLocaleDateString() : 'Never'}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-50/50 p-4 flex justify-between items-center border-t border-slate-100">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSync(repo.id)}
                    isLoading={syncMutation.isPending}
                    className="font-bold text-blue-600 hover:bg-blue-100 hover:text-blue-700 rounded-lg h-9"
                    disabled={repo.source !== 'github'}
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${syncMutation.isPending ? 'animate-spin' : ''}`} />
                    Refresh Node Graph
                  </Button>
                  <Button size="sm" variant="ghost" className="h-9 w-9 p-0 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Clone Modal */}
      <Modal
        isOpen={isCloneModalOpen}
        onClose={() => setIsCloneModalOpen(false)}
        title="Connect Knowledge Source"
      >
        <div className="space-y-6 pt-2">
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            Provide a GitHub repository URL. RepoGuardian will clone, index, and build a dependency graph for deep analysis.
          </p>
          <Input
            label="GitHub URL"
            placeholder="https://github.com/username/repository"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="h-12 rounded-xl"
          />
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="ghost" onClick={() => setIsCloneModalOpen(false)} className="h-12 px-6 rounded-xl font-bold">
              Dismiss
            </Button>
            <Button
              onClick={handleClone}
              isLoading={cloneMutation.isPending}
              disabled={!repoUrl.trim()}
              className="h-12 px-8 rounded-xl font-bold bg-blue-600 text-white"
            >
              Start Autonomous Indexing
            </Button>
          </div>
        </div>
      </Modal>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Structural Base"
      >
        <div className="space-y-6 pt-2">
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            Upload a local project ZIP. This is useful for analyzing private codebases without cloud git integration.
          </p>
          <div 
            className={`border-2 border-dashed rounded-[2rem] p-12 text-center transition-all ${selectedFile ? 'border-blue-300 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'}`}
          >
            <input
              type="file"
              accept=".zip"
              id="zip-upload"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <label htmlFor="zip-upload" className="cursor-pointer group">
               <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Upload className={`w-8 h-8 ${selectedFile ? 'text-blue-600' : 'text-slate-300'}`} />
               </div>
               <p className="text-sm font-bold text-slate-700">{selectedFile ? selectedFile.name : 'Select ZIP Archive'}</p>
               <p className="text-xs font-bold text-slate-400 mt-2">Maximum size: 50MB</p>
            </label>
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="ghost" onClick={() => setIsUploadModalOpen(false)} className="h-12 px-6 rounded-xl font-bold">
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              isLoading={uploadMutation.isPending}
              disabled={!selectedFile}
              className="h-12 px-8 rounded-xl font-bold bg-blue-600 text-white"
            >
              Analyze & Index
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FolderGit2, Upload, RefreshCw, Trash2, GitBranch, Calendar } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Repositories</h1>
          <p className="text-gray-600 mt-1">
            Manage your code repositories for AI analysis
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => setIsCloneModalOpen(true)}
            variant="primary"
            className="flex items-center space-x-2"
          >
            <GitBranch className="w-4 h-4" />
            <span>Clone from GitHub</span>
          </Button>
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Upload className="w-4 h-4" />
            <span>Upload ZIP</span>
          </Button>
        </div>
      </div>

      {/* Repositories Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : repositories.length === 0 ? (
        <Card variant="elevated">
          <CardContent className="text-center py-12">
            <FolderGit2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No repositories yet
            </h3>
            <p className="text-gray-600 mb-6">
              Get started by cloning a GitHub repository or uploading a ZIP file
            </p>
            <div className="flex justify-center space-x-3">
              <Button onClick={() => setIsCloneModalOpen(true)}>
                Clone Repository
              </Button>
              <Button variant="outline" onClick={() => setIsUploadModalOpen(true)}>
                Upload ZIP
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {repositories.map((repo, index) => (
            <motion.div
              key={repo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card variant="elevated" className="h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {repo.source === 'github' ? (
                        <GitBranch className="w-5 h-5 text-gray-600" />
                      ) : (
                        <Upload className="w-5 h-5 text-gray-600" />
                      )}
                      <CardTitle className="text-lg">{repo.name}</CardTitle>
                    </div>
                  </div>
                  {repo.url && (
                    <CardDescription className="truncate">{repo.url}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Added: {new Date(repo.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {repo.lastSynced && (
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="w-4 h-4" />
                        <span>
                          Synced: {new Date(repo.lastSynced).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSync(repo.id)}
                    isLoading={syncMutation.isPending}
                    disabled={repo.source !== 'github'}
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Sync
                  </Button>
                  <Button size="sm" variant="ghost">
                    <Trash2 className="w-4 h-4 text-red-600" />
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
        title="Clone GitHub Repository"
      >
        <div className="space-y-4">
          <Input
            label="GitHub Repository URL"
            placeholder="https://github.com/username/repo"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
          />
          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={() => setIsCloneModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleClone}
              isLoading={cloneMutation.isPending}
              disabled={!repoUrl.trim()}
            >
              Clone & Index
            </Button>
          </div>
        </div>
      </Modal>

      {/* Upload Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Repository ZIP"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select ZIP File
            </label>
            <input
              type="file"
              accept=".zip"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {selectedFile && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {selectedFile.name}
              </p>
            )}
          </div>
          <div className="flex justify-end space-x-3">
            <Button variant="ghost" onClick={() => setIsUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              isLoading={uploadMutation.isPending}
              disabled={!selectedFile}
            >
              Upload & Index
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

// Made with Bob

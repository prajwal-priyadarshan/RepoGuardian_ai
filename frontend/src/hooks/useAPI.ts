import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api.client';
import { useAppStore } from '../store/useAppStore';
import type {
  CloneRepoRequest,
  ImpactAnalysisRequest,
  EmbeddingQueryRequest,
  AIAnalyzeRequest,
  AIManualAnalyzeRequest,
  SelfHealRequest,
} from '../types/api.types';

const getRepoDisplayNameFromUrl = (repoUrl: string) => {
  const cleaned = repoUrl.trim().replace(/\/$/, '').replace(/\.git$/i, '');
  return cleaned.split('/').pop() || 'Unknown';
};

const getRepoDisplayNameFromFile = (fileName: string) => fileName.replace(/\.[^/.]+$/, '') || 'Uploaded Repository';

// ============================================
// Query Keys
// ============================================
export const queryKeys = {
  health: ['health'] as const,
  repositories: ['repositories'] as const,
  githubRepositories: ['github-repositories'] as const,
  impactAnalysis: (repoId: string) => ['impact', repoId] as const,
  aiAnalysis: (repoId: string) => ['ai-analysis', repoId] as const,
  searchResults: (query: string, repoId: string) => ['search', repoId, query] as const,
  selfHeal: (repoId: string) => ['self-heal', repoId] as const,
};

// ============================================
// Health Check Hook
// ============================================
export const useHealthCheck = () => {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () => api.healthCheck(),
    refetchInterval: 30000, // Check every 30 seconds
    retry: 3,
  });
};

// ============================================
// GitHub Repositories Hook
// ============================================
export const useGitHubRepos = () => {
  const { sessionToken } = useAppStore();
  return useQuery({
    queryKey: queryKeys.githubRepositories,
    queryFn: () => api.getGitHubRepos(),
    enabled: !!sessionToken,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// ============================================
// Repository Management Hooks
// ============================================
export const useCloneRepo = () => {
  const queryClient = useQueryClient();
  const { addRepository, setLoading, setError, setSuccess } = useAppStore();

  return useMutation({
    mutationFn: (data: CloneRepoRequest) => api.cloneRepo(data),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (data, variables) => {
      addRepository({
        id: data.repo_id,
        name: getRepoDisplayNameFromUrl(variables.repo_url),
        source: 'github',
        url: variables.repo_url,
        createdAt: new Date().toISOString(),
      });
      setSuccess('Repository cloned and indexed successfully!');
      queryClient.invalidateQueries({ queryKey: queryKeys.repositories });
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to clone repository');
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

export const useUploadRepo = () => {
  const queryClient = useQueryClient();
  const { addRepository, setLoading, setError, setSuccess } = useAppStore();

  return useMutation({
    mutationFn: (file: File) => api.uploadRepo(file),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (data, file) => {
      addRepository({
        id: data.repo_id,
        name: getRepoDisplayNameFromFile(file.name),
        source: 'upload',
        createdAt: new Date().toISOString(),
      });
      setSuccess('Repository uploaded and indexed successfully!');
      queryClient.invalidateQueries({ queryKey: queryKeys.repositories });
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to upload repository');
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

export const useSyncRepo = () => {
  const queryClient = useQueryClient();
  const { updateRepoSync, setLoading, setError, setSuccess } = useAppStore();

  return useMutation({
    mutationFn: (repoId: string) => api.syncRepo(repoId),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (data) => {
      updateRepoSync(data.repo_id, new Date().toISOString());
      setSuccess(data.message);
      queryClient.invalidateQueries({ queryKey: queryKeys.repositories });
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to sync repository');
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

// ============================================
// Impact Analysis Hook
// ============================================
export const useImpactAnalysis = () => {
  const { setImpactAnalysis, setLoading, setError, setSuccess } = useAppStore();

  return useMutation({
    mutationFn: (data: ImpactAnalysisRequest) => api.analyzeImpact(data),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (data) => {
      setImpactAnalysis(data);
      setSuccess('Impact analysis completed!');
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to analyze impact');
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

// ============================================
// Embeddings/Search Hooks
// ============================================
export const useStoreEmbeddings = () => {
  const { setLoading, setError, setSuccess } = useAppStore();

  return useMutation({
    mutationFn: (repoId: string) => api.storeEmbeddings(repoId),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (data) => {
      setSuccess(data.message);
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to store embeddings');
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

export const useSearchCode = () => {
  const { setSearchResults, setLoading, setError } = useAppStore();

  return useMutation({
    mutationFn: (data: EmbeddingQueryRequest) => api.queryEmbeddings(data),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (data) => {
      setSearchResults(data);
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to search code');
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

// ============================================
// AI Analysis Hooks
// ============================================
export const useAIAnalysis = () => {
  const { setAIAnalysis, setLoading, setError, setSuccess } = useAppStore();

  return useMutation({
    mutationFn: (data: AIAnalyzeRequest) => api.analyzeCode(data),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (data) => {
      setAIAnalysis(data);
      if (data.message) {
        setSuccess(data.message);
      } else {
        setSuccess('AI analysis completed!');
      }
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to analyze code');
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

export const useAIManualAnalysis = () => {
  const { setLoading, setError, setSuccess } = useAppStore();

  return useMutation({
    mutationFn: (data: AIManualAnalyzeRequest) => api.analyzeCodeManual(data),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: () => {
      setSuccess('Manual analysis completed!');
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to analyze code manually');
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

// ============================================
// Self-Healing Hook
// ============================================
export const useSelfHeal = () => {
  const { setSelfHealResults, setLoading, setError, setSuccess } = useAppStore();

  return useMutation({
    mutationFn: (data: SelfHealRequest) => api.triggerSelfHeal(data),
    onMutate: () => {
      setLoading(true);
      setError(null);
    },
    onSuccess: (data) => {
      setSelfHealResults(data);
      if (data.message) {
        setSuccess(data.message);
      } else {
        setSuccess('Self-healing completed!');
      }
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to trigger self-healing');
    },
    onSettled: () => {
      setLoading(false);
    },
  });
};

// Made with Bob

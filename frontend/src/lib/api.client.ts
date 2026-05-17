import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';
import type {
  CloneRepoRequest,
  CloneRepoResponse,
  UploadRepoResponse,
  SyncRepoResponse,
  ImpactAnalysisRequest,
  ImpactAnalysisResponse,
  EmbeddingQueryRequest,
  EmbeddingQueryResponse,
  StoreEmbeddingsResponse,
  AIAnalyzeRequest,
  AIAnalyzeResponse,
  AIManualAnalyzeRequest,
  AIManualAnalyzeResponse,
  SelfHealRequest,
  SelfHealResponse,
  RootStatusResponse,
  HealthStatusResponse,
  ScanRepoResponse,
  ParseRepoResponse,
  BuildGraphResponse,
  ClearGraphResponse,
  GitDiffResponse,
  PRGenerateRequest,
  PRGenerateResponse,
  PRPatchResponse,
  PRSummaryResponse,
  PRRiskResponse,
  APIError,
} from '../types/api.types';

// ============================================
// Environment Configuration
// ============================================
const getBaseURL = (): string => {
  const mode = import.meta.env.VITE_MODE || 'development';
  
  if (mode === 'production') {
    return import.meta.env.VITE_API_URL_PROD || 'https://repoguardian-ai.onrender.com';
  }
  
  return import.meta.env.VITE_API_URL_DEV || 'http://127.0.0.1:8000';
};

// ============================================
// Axios Instance Configuration
// ============================================
const apiClient: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 120000, // 2 minutes for long-running operations
  headers: {
    'Content-Type': 'application/json',
  },
});

import { useAppStore } from '../store/useAppStore';

// apiClient interceptor configuration
apiClient.interceptors.request.use(
  (config) => {
    const token = useAppStore.getState().sessionToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (import.meta.env.DEV) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor (for error handling)
apiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`[API Response] ${response.config.url}`, response.data);
    }
    return response;
  },
  (error: AxiosError<APIError>) => {
    const errorMessage = error.response?.data?.detail || error.message || 'An unexpected error occurred';
    
    if (import.meta.env.DEV) {
      console.error('[API Error]', {
        url: error.config?.url,
        status: error.response?.status,
        message: errorMessage,
      });
    }
    
    return Promise.reject({
      message: errorMessage,
      status: error.response?.status,
    });
  }
);

// ============================================
// API Service Class
// ============================================
class APIService {
  // Health / Service Status
  async getRootStatus(): Promise<RootStatusResponse> {
    const response = await apiClient.get<RootStatusResponse>('/');
    return response.data;
  }

  async getHealthStatus(): Promise<HealthStatusResponse> {
    const response = await apiClient.get<HealthStatusResponse>('/health');
    return response.data;
  }

  // Repository Management Endpoints
  async cloneRepo(data: CloneRepoRequest): Promise<CloneRepoResponse> {
    const response = await apiClient.post<CloneRepoResponse>('/repo/clone', data);
    return response.data;
  }

  async uploadRepo(file: File): Promise<UploadRepoResponse> {
    const formData = new FormData();
    formData.append('file', file);

    // In development mode use the dev-upload endpoint which bypasses auth and RLS
    const uploadPath = (import.meta.env.VITE_MODE === 'development') ? '/repo/dev-upload' : '/repo/upload';

    const response = await apiClient.post<UploadRepoResponse>(uploadPath, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async syncRepo(repoId: string): Promise<SyncRepoResponse> {
    const response = await apiClient.post<SyncRepoResponse>(`/repo/sync/${repoId}`);
    return response.data;
  }

  // Code Scanning & Parsing
  async scanRepo(repoId: string): Promise<ScanRepoResponse> {
    const response = await apiClient.get<ScanRepoResponse>(`/scan/${repoId}`);
    return response.data;
  }

  async parseRepo(repoId: string): Promise<ParseRepoResponse> {
    const response = await apiClient.get<ParseRepoResponse>(`/parse/${repoId}`);
    return response.data;
  }

  // Graph Operations
  async buildGraph(repoId: string): Promise<BuildGraphResponse> {
    const response = await apiClient.post<BuildGraphResponse>(`/graph/build/${repoId}`);
    return response.data;
  }

  async clearGraph(): Promise<ClearGraphResponse> {
    const response = await apiClient.delete<ClearGraphResponse>('/graph/clear');
    return response.data;
  }

  // Git Operations
  async gitDiff(repoId: string): Promise<GitDiffResponse> {
    const response = await apiClient.post<GitDiffResponse>(`/git/diff/${repoId}`);
    return response.data;
  }

  // Impact Analysis Endpoint
  async analyzeImpact(data: ImpactAnalysisRequest): Promise<ImpactAnalysisResponse> {
    const response = await apiClient.post<ImpactAnalysisResponse>('/impact/analyze', data);
    return response.data;
  }

  // Embeddings/Search Endpoints
  async storeEmbeddings(repoId: string): Promise<StoreEmbeddingsResponse> {
    const response = await apiClient.post<StoreEmbeddingsResponse>(`/embeddings/store/${repoId}`);
    return response.data;
  }

  async queryEmbeddings(data: EmbeddingQueryRequest): Promise<EmbeddingQueryResponse> {
    const response = await apiClient.post<EmbeddingQueryResponse>('/embeddings/query', data);
    return response.data;
  }

  // AI Analysis Endpoints
  async analyzeCode(data: AIAnalyzeRequest): Promise<AIAnalyzeResponse> {
    const path = (import.meta.env.VITE_MODE === 'development') ? '/ai/analyze/dev' : '/ai/analyze';
    const response = await apiClient.post<AIAnalyzeResponse>(path, data);
    return response.data;
  }

  async analyzeCodeManual(data: AIManualAnalyzeRequest): Promise<AIManualAnalyzeResponse> {
    const response = await apiClient.post<AIManualAnalyzeResponse>('/ai/analyze/manual', data);
    return response.data;
  }

  // Self-Healing Endpoint
  async triggerSelfHeal(data: SelfHealRequest): Promise<SelfHealResponse> {
    const response = await apiClient.post<SelfHealResponse>('/self-heal/', data);
    return response.data;
  }

  // Pull Request Generation
  async generatePullRequest(data: PRGenerateRequest): Promise<PRGenerateResponse> {
    const response = await apiClient.post<PRGenerateResponse>('/pr/generate', data);
    return response.data;
  }

  async generatePullRequestPatch(repoId: string): Promise<PRPatchResponse> {
    const response = await apiClient.post<PRPatchResponse>('/pr/patch', { repo_id: repoId });
    return response.data;
  }

  async generatePullRequestSummary(data: PRGenerateRequest): Promise<PRSummaryResponse> {
    const response = await apiClient.post<PRSummaryResponse>('/pr/summary', data);
    return response.data;
  }

  async analyzePullRequestRisk(repoId: string): Promise<PRRiskResponse> {
    const response = await apiClient.post<PRRiskResponse>('/pr/risk-analysis', { repo_id: repoId });
    return response.data;
  }

  // Health Check
  async healthCheck(): Promise<string> {
    const response = await apiClient.get<string>('/');
    return response.data;
  }
}

// Export singleton instance
export const api = new APIService();

// Export axios instance for custom requests if needed
export { apiClient };

// Export base URL getter for display purposes
export { getBaseURL };

// Made with Bob

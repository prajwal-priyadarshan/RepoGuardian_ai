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
  // Repository Management Endpoints
  async cloneRepo(data: CloneRepoRequest): Promise<CloneRepoResponse> {
    const response = await apiClient.post<CloneRepoResponse>('/repo/clone', data);
    return response.data;
  }

  async uploadRepo(file: File): Promise<UploadRepoResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post<UploadRepoResponse>('/repo/upload', formData, {
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
    const response = await apiClient.post<AIAnalyzeResponse>('/ai/analyze', data);
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

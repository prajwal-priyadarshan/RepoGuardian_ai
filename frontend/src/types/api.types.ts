// ============================================
// API Request & Response Types
// ============================================

// Repository Management Types
export interface CloneRepoRequest {
  repo_url: string;
}

export interface CloneRepoResponse {
  repo_id: string;
  status: string;
}

export interface UploadRepoResponse {
  repo_id: string;
  status: string;
}

export interface SyncRepoResponse {
  repo_id: string;
  status: string;
  message: string;
}

// Impact Analysis Types
export interface ImpactAnalysisRequest {
  repo_id: string;
}

export interface FunctionImpact {
  function: string;
  affected_files: string[];
  semantic_context: string[];
  risk_score?: number;
}

export interface ImpactAnalysisResponse {
  repo_id: string;
  changed_functions?: {
    raw_diff: string;
    functions: string[];
  };
  impact: FunctionImpact[];
  risk_score?: number;
}

// Embeddings/Search Types
export interface EmbeddingQueryRequest {
  query: string;
  repo_id: string;
}

export interface EmbeddingResult {
  id: string;
  score: number;
  metadata: {
    file_path: string;
    function_name: string;
    code: string;
    line_start?: number;
    line_end?: number;
  };
}

export interface EmbeddingQueryResponse {
  results: EmbeddingResult[];
}

export interface StoreEmbeddingsResponse {
  status: string;
  message: string;
}

// AI Analysis Types
export interface AIAnalyzeRequest {
  repo_id: string;
}

export interface AIManualAnalyzeRequest {
  repo_id: string;
  file_path: string;
  function: string;
  new_code: string;
}

export interface CodeAnalysisResult {
  function: string;
  explanation: string;
  risks: string[];
  why_breaks: string;
  suggestions: string[];
  fixed_code: string;
  semantic_context?: string[];
  risk_score?: number;
}

export interface AIAnalyzeResponse {
  repo_id: string;
  message?: string;
  analyses: CodeAnalysisResult[];
}

export interface AIManualAnalyzeResponse {
  repo_id: string;
  analysis: CodeAnalysisResult;
}

// Self-Healing Types
export interface SelfHealRequest {
  repo_id: string;
}

export interface HealResult {
  entity: string;
  file: string;
  result: {
    status: string;
    message: string;
    commit_sha?: string;
    validation?: {
      syntax_valid: boolean;
      errors?: string[];
    };
  };
}

export interface SelfHealResponse {
  repo_id: string;
  status?: string;
  message?: string;
  summary: HealResult[];
}

// Repository Workflow Types
export interface RootStatusResponse {
  status: string;
  service: string;
  version: string;
  endpoints?: {
    docs: string;
    health: string;
  };
}

export interface HealthStatusResponse {
  status: string;
  service: string;
}

export interface ScanRepoResponse {
  repo_id: string;
  files: string[];
}

export interface ParseRepoResponse {
  repo_id: string;
  parsed_data: unknown;
}

export interface BuildGraphResponse {
  repo_id: string;
  status: string;
}

export interface ClearGraphResponse {
  status: string;
  message: string;
}

export interface GitDiffResponse {
  changed_functions: string[];
  raw_diff: string;
}

export interface PRGenerateRequest {
  repo_id: string;
  github_token?: string;
}

export interface PRGenerateResponse {
  repo_id?: string;
  status?: string;
  message?: string;
  patch?: {
    type?: string;
    file?: string;
  };
  summary?: unknown;
  pr_result?: unknown;
}

export interface PRPatchResponse {
  repo_id: string;
  patch: unknown;
}

export interface PRSummaryResponse {
  repo_id: string;
  summary: unknown;
}

export interface PRRiskResponse {
  repo_id: string;
  risk_analysis: unknown;
  pr_summary: unknown;
}

// Error Response Type
export interface APIError {
  detail: string;
  status?: number;
}

// Common Status Type
export type APIStatus = 'idle' | 'loading' | 'success' | 'error';

// Made with Bob

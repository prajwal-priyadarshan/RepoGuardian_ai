import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import type {
  ImpactAnalysisResponse,
  AIAnalyzeResponse,
  EmbeddingQueryResponse,
  SelfHealResponse,
} from '../types/api.types';
import { apiClient } from '../lib/api.client';

// ============================================
// Store State Interface
// ============================================
export interface Repository {
  id: string;
  name: string;
  source: 'github' | 'upload';
  url?: string;
  createdAt: string;
  lastSynced?: string;
}

interface AppState {
  // Auth State
  user: User | null;
  sessionToken: string | null;
  authLoading: boolean;
  githubConnected: boolean;
  githubRepoCount: number;

  // Repository Management
  repositories: Repository[];
  currentRepoId: string | null;
  
  // Analysis Results
  impactAnalysis: ImpactAnalysisResponse | null;
  aiAnalysis: AIAnalyzeResponse | null;
  searchResults: EmbeddingQueryResponse | null;
  selfHealResults: SelfHealResponse | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  
  // Actions
  setSession: (session: any) => void;
  logout: () => void;
  fetchRepositories: () => Promise<void>;
  fetchGitHubRepoCount: (providerToken: string | null) => Promise<void>;
  
  addRepository: (repo: Repository) => void;
  setCurrentRepo: (repoId: string) => void;
  updateRepoSync: (repoId: string, timestamp: string) => void;
  removeRepository: (repoId: string) => void;
  
  setImpactAnalysis: (data: ImpactAnalysisResponse | null) => void;
  setAIAnalysis: (data: AIAnalyzeResponse | null) => void;
  setSearchResults: (data: EmbeddingQueryResponse | null) => void;
  setSelfHealResults: (data: SelfHealResponse | null) => void;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSuccess: (message: string | null) => void;
  clearMessages: () => void;
  
  reset: () => void;
}

// ============================================
// Initial State
// ============================================
const initialState = {
  user: null,
  sessionToken: null,
  authLoading: true,
  githubConnected: false,
  githubRepoCount: 0,
  repositories: [],
  currentRepoId: null,
  impactAnalysis: null,
  aiAnalysis: null,
  searchResults: null,
  selfHealResults: null,
  isLoading: false,
  error: null,
  successMessage: null,
};

// ============================================
// Zustand Store with DevTools & Persistence
// ============================================
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // Auth Actions
        setSession: (session) => {
          const user = session?.user || null;
          const token = session?.access_token || null;
          const providerToken = session?.provider_token || null;
          
          set({ 
            user, 
            sessionToken: token,
            githubConnected: Boolean(user && providerToken),
            authLoading: false
          }, false, 'setSession');
          
          if (user) {
            // Load their remote database repository mappings automatically!
            get().fetchGitHubRepoCount(providerToken);
            get().fetchRepositories();
          }
        },
        
        logout: async () => {
          await supabase.auth.signOut();
          set({
            ...initialState,
            authLoading: false
          }, false, 'logout');
        },
        
        // Data Fetching Actions
        fetchRepositories: async () => {
          const token = get().sessionToken;
          if (!token) return;
          try {
            set({ isLoading: true });
            const response = await apiClient.get('/repo/list');
            const reposRaw = (response.data || []) as any[];
            const repos: Repository[] = reposRaw.map((repo) => ({
              id: repo.id,
              name: repo.name,
              source: repo.source === 'upload' ? 'upload' : 'github',
              url: repo.url || repo.repo_url,
              createdAt: repo.createdAt || repo.created_at || new Date().toISOString(),
              lastSynced: repo.lastSynced || repo.last_synced,
            }));
            set({ repositories: repos, githubRepoCount: repos.length, isLoading: false });
          } catch (error: any) {
            set({ error: error.message || 'Failed to fetch repositories.', isLoading: false });
          }
        },
        fetchGitHubRepoCount: async (providerToken) => {
          // URL-based demo mode: show count from indexed repos to avoid auth-coupled GitHub calls.
          const currentCount = get().repositories.length;
          set({ githubRepoCount: currentCount, githubConnected: Boolean(providerToken || get().user) });
        },
        
        // Repository Actions
        addRepository: (repo) =>
          set((state) => ({
            repositories: [repo, ...state.repositories],
            currentRepoId: repo.id,
          }), false, 'addRepository'),
        
        setCurrentRepo: (repoId) =>
          set({ currentRepoId: repoId }, false, 'setCurrentRepo'),
        
        updateRepoSync: (repoId, timestamp) =>
          set((state) => ({
            repositories: state.repositories.map((repo) =>
              repo.id === repoId ? { ...repo, lastSynced: timestamp } : repo
            ),
          }), false, 'updateRepoSync'),
        
        removeRepository: (repoId) =>
          set((state) => ({
            repositories: state.repositories.filter((repo) => repo.id !== repoId),
            currentRepoId: state.currentRepoId === repoId ? null : state.currentRepoId,
          }), false, 'removeRepository'),
        
        // Analysis Actions
        setImpactAnalysis: (data) =>
          set({ impactAnalysis: data }, false, 'setImpactAnalysis'),
        
        setAIAnalysis: (data) =>
          set({ aiAnalysis: data }, false, 'setAIAnalysis'),
        
        setSearchResults: (data) =>
          set({ searchResults: data }, false, 'setSearchResults'),
        
        setSelfHealResults: (data) =>
          set({ selfHealResults: data }, false, 'setSelfHealResults'),
        
        // UI State Actions
        setLoading: (loading) =>
          set({ isLoading: loading }, false, 'setLoading'),
        
        setError: (error) =>
          set({ error, successMessage: null }, false, 'setError'),
        
        setSuccess: (message) =>
          set({ successMessage: message, error: null }, false, 'setSuccess'),
        
        clearMessages: () =>
          set({ error: null, successMessage: null }, false, 'clearMessages'),
        
        // Reset
        reset: () =>
          set(initialState, false, 'reset'),
      }),
      {
        name: 'repoguardian-storage',
        partialize: (state) => ({
          currentRepoId: state.currentRepoId,
        }),
      }
    ),
    { name: 'RepoGuardian Store' }
  )
);

// ============================================
// Selectors (for optimized re-renders)
// ============================================
export const selectCurrentRepo = (state: AppState) =>
  state.repositories.find((repo) => repo.id === state.currentRepoId);

export const selectHasRepositories = (state: AppState) =>
  state.repositories.length > 0;

export const selectIsAnalyzing = (state: AppState) =>
  state.isLoading && (state.impactAnalysis !== null || state.aiAnalysis !== null);

// Made with Bob

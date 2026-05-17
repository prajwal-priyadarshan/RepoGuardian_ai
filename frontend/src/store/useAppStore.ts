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
          
          set({ 
            user, 
            sessionToken: token,
            authLoading: false
          }, false, 'setSession');
          
          if (user) {
            // Load their remote database repository mappings automatically!
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
        
        fetchRepositories: async () => {
          try {
            set({ isLoading: true }, false, 'fetchRepositories/loading');
            const { data, error } = await supabase
              .from('repositories')
              .select('*')
              .order('created_at', { ascending: false });
              
            if (error) throw error;
            
            if (data) {
              const mapped: Repository[] = data.map((row: any) => ({
                id: row.id,
                name: row.name,
                source: row.source as 'github' | 'upload',
                url: row.repo_url || undefined,
                createdAt: row.created_at,
                // Local synced details are stored under custom states if needed
              }));
              
              set({ 
                repositories: mapped,
                currentRepoId: mapped.length > 0 ? mapped[0].id : null,
                isLoading: false 
              }, false, 'fetchRepositories/success');
            }
          } catch (err: any) {
            set({ 
              error: err.message || 'Failed to fetch repository metadata',
              isLoading: false 
            }, false, 'fetchRepositories/error');
          }
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

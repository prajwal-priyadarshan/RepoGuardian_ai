import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { useAppStore } from './store/useAppStore';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { Repositories } from './pages/Repositories';
import { Operations } from './pages/Operations';
import { AIAnalysis } from './pages/AIAnalysis';
import { ImpactAnalysis } from './pages/ImpactAnalysis';
import { SelfHealing } from './pages/SelfHealing';
import { CodeSearch } from './pages/CodeSearch';
import { NotFound } from './pages/NotFound';
import { AuthGuard } from './components/AuthGuard';
import { ScrollToTop } from './components/ScrollToTop';

function App() {
  const { setSession, fetchRepositories, fetchGitHubRepoCount, sessionToken } = useAppStore();

  useEffect(() => {
    // 🔍 1. Recover active token/session from Supabase client on load
    supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      setSession(data.session);
    });

    // 🔄 2. Listen dynamically for all Auth events (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: Session | null) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setSession]);

  useEffect(() => {
    if (sessionToken) {
      fetchRepositories();
      fetchGitHubRepoCount(sessionToken);
    }
  }, [sessionToken, fetchRepositories, fetchGitHubRepoCount]);

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* Public Landing View */}
        <Route path="/" element={<Home />} />
        
        {/* Protected Dashboard Core Operations */}
        <Route path="/dashboard" element={<AuthGuard><Layout><Dashboard /></Layout></AuthGuard>} />
        <Route path="/repositories" element={<AuthGuard><Layout><Repositories /></Layout></AuthGuard>} />
        <Route path="/operations" element={<AuthGuard><Layout><Operations /></Layout></AuthGuard>} />
        <Route path="/ai-analysis" element={<AuthGuard><Layout><AIAnalysis /></Layout></AuthGuard>} />
        <Route path="/impact" element={<AuthGuard><Layout><ImpactAnalysis /></Layout></AuthGuard>} />
        <Route path="/self-heal" element={<AuthGuard><Layout><SelfHealing /></Layout></AuthGuard>} />
        <Route path="/search" element={<AuthGuard><Layout><CodeSearch /></Layout></AuthGuard>} />

        {/* Fallback 404 System Alert */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;

// Made with Bob

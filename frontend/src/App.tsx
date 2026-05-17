import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { useAppStore } from './store/useAppStore';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { Repositories } from './pages/Repositories';
import { AIAnalysis } from './pages/AIAnalysis';
import { ImpactAnalysis } from './pages/ImpactAnalysis';
import { SelfHealing } from './pages/SelfHealing';
import { CodeSearch } from './pages/CodeSearch';
import { AuthGuard } from './components/AuthGuard';
import { ScrollToTop } from './components/ScrollToTop';

function App() {
  const { setSession } = useAppStore();

  useEffect(() => {
    // 🔍 1. Recover active token/session from Supabase client on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // 🔄 2. Listen dynamically for all Auth events (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setSession]);

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/*"
          element={
            <AuthGuard>
              <Layout>
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/repositories" element={<Repositories />} />
                  <Route path="/ai-analysis" element={<AIAnalysis />} />
                  <Route path="/impact" element={<ImpactAnalysis />} />
                  <Route path="/self-heal" element={<SelfHealing />} />
                  <Route path="/search" element={<CodeSearch />} />
                </Routes>
              </Layout>
            </AuthGuard>
          }
        />
      </Routes>
    </>
  );
}

export default App;

// Made with Bob

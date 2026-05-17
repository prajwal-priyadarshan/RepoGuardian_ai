import { type ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { LoadingSpinner } from './ui';

interface AuthGuardProps {
  children: ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, authLoading } = useAppStore();
  const navigate = useNavigate();

  useEffect(() => {
    // 🔍 Avoid premature redirects if we are in the middle of processing a Supabase OAuth callback hash
    const hasHashCallback = window.location.hash.includes('access_token=') || 
                            window.location.hash.includes('error=') ||
                            window.location.search.includes('code=');

    if (!authLoading && !user && !hasHashCallback) {
      // Elegant redirect to Home landing page if unauthenticated
      navigate('/', { replace: true });
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center space-y-4">
        <LoadingSpinner size="lg" />
        <p className="text-white/40 font-bold animate-pulse uppercase tracking-widest text-xs">
          Authenticating Session...
        </p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
};

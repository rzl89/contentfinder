import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store';
import { Sparkles } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Wraps any route that requires authentication.
 * - While auth is initializing: shows a minimal loading screen
 * - If not logged in: redirects to /login (saves current path for redirect-back)
 * - If logged in: renders children
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, initialized } = useAuthStore();
  const location = useLocation();

  // Show spinner while Supabase session is being hydrated
  if (!initialized) {
    return (
      <div className="min-h-screen bg-[#06060a] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center mx-auto animate-pulse">
            <Sparkles className="w-6 h-6 text-black" />
          </div>
          <p className="text-xs text-zinc-500">Memuat studio...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Preserve the intended destination so we can redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

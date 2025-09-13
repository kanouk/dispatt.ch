import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user, loading, adminLoading, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || (requireAdmin && adminLoading)) return;

    if (!user) {
      navigate('/login');
      return;
    }

    if (requireAdmin && !isAdmin()) {
      navigate('/forbidden');
      return;
    }
  }, [user, loading, adminLoading, isAdmin, navigate, requireAdmin]);

  if (loading || (requireAdmin && adminLoading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!user) return null;
  if (requireAdmin && !isAdmin()) return null;

  return <>{children}</>;
};
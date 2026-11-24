import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Spinner } from './ui';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAdmin, ready } = useAuth();
  const location = useLocation();
  if (!ready) return <Spinner label="Checking your login…" />;
  if (!isAdmin) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}

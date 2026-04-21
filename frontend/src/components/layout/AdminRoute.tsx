/**
 * AdminRoute — requires admin role, redirects others to /dashboard
 */
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/store';

export function AdminRoute() {
  const { isAuthenticated, user, isInitialized } = useAppSelector((state) => state.auth);
  if (!isInitialized) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

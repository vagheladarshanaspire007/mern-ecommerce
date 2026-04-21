/**
 * GuestRoute — redirects logged-in users away from auth pages
 */
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/store';

export function GuestRoute() {
  const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);
  if (!isInitialized) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

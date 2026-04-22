/**
 * ============================================================
 * Route Guards — src/components/layout/
 * ============================================================
 * WHY route guards:
 *   Prevent unauthorized access at the route level.
 *   Without guards, a user could manually navigate to /admin
 *   or /checkout even without being logged in.
 *
 * Pattern: <Outlet /> renders the child route when access is granted.
 * The guard decides whether to render <Outlet /> or redirect.
 * ============================================================
 */

// ── ProtectedRoute.tsx ────────────────────────────────────────
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store';

/**
 * Redirects unauthenticated users to /login.
 * WHY state.from: After login, redirect user back to the page they
 * were trying to visit (better UX than always going to /dashboard).
 */
export function ProtectedRoute() {
  const { isAuthenticated, isInitialized } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // Wait until we've checked for an existing session (silent refresh)
  if (!isInitialized) return null; // Or <PageLoader /> while checking

  if (!isAuthenticated) {
    const redirectPath = `${location.pathname}${location.search}${location.hash}`;
    const loginUrl = `/login?redirect=${encodeURIComponent(redirectPath)}`;
    return <Navigate to={loginUrl} state={{ from: location }} replace />;
  }

  return <Outlet />;
}

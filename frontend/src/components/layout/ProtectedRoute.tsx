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

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store';

/**
 * Redirects unauthenticated users to /login?redirect=...
 *
 * WHY redirect:
 * After login, the user is returned to the page they originally
 * wanted to visit instead of always going to /dashboard.
 */
export function ProtectedRoute() {
  const { isAuthenticated, isInitialized } = useAppSelector(
    (state) => state.auth,
  );

  const location = useLocation();

  // Wait until we've checked for an existing session.
  if (!isInitialized) {
    return null;
  }

  if (!isAuthenticated) {
    const redirect = `${location.pathname}${location.search}`;

    return (
      <Navigate
        to={`/login?redirect=${encodeURIComponent(redirect)}`}
        replace
      />
    );
  }

  return <Outlet />;
}
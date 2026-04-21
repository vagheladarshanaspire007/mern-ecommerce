/**
 * ============================================================
 * App.tsx — Root Component with Route Definitions
 * ============================================================
 * Route structure:
 *   /                    → Landing / redirect based on auth
 *   /login               → Login page (guest only)
 *   /register            → Register page (guest only)
 *   /dashboard           → User dashboard (protected)
 *   /products            → Product listing (public)
 *   /products/:id        → Product detail (public)
 *   /cart                → Shopping cart (protected)
 *   /checkout            → Checkout flow (protected)
 *   /admin/*             → Admin panel (admin role only)
 *   *                    → 404 Not Found
 *
 * Route Guards:
 *   <ProtectedRoute>    → Redirects to /login if not authenticated
 *   <GuestRoute>        → Redirects to /dashboard if already logged in
 *   <AdminRoute>        → Redirects to /dashboard if not admin
 * ============================================================
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { GuestRoute } from '@/components/layout/GuestRoute';
import { AdminRoute } from '@/components/layout/AdminRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageLoader } from '@/components/ui/PageLoader';

// ─── Lazy Loaded Pages ───────────────────────────────────────
// WHY lazy(): Code splitting — each page is a separate JS chunk.
// Users only download code for pages they actually visit.
// WHY Suspense: Shows fallback while the chunk loads.
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const ProductListPage = lazy(() => import('@/pages/products/ProductListPage'));
const ProductDetailPage = lazy(() => import('@/pages/products/ProductDetailPage'));
const CartPage = lazy(() => import('@/pages/CartPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── Guest Only (redirect to /dashboard if logged in) ── */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* ── Public routes with main layout ─────────────────── */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />

          {/* ── Protected routes (login required) ────────────── */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>

          {/* ── Admin routes (admin role required) ───────────── */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/*" element={<AdminDashboardPage />} />
          </Route>
        </Route>

        {/* ── 404 ──────────────────────────────────────────────── */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

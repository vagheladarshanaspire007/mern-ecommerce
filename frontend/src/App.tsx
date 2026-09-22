import { useSocket } from '@/hooks/useSocket';
/**
 * ============================================================
 * App.tsx â€” Root Component with Route Definitions
 * ============================================================
 * Route structure:
 *   /                    â†’ Landing / redirect based on auth
 *   /login               â†’ Login page (guest only)
 *   /register            â†’ Register page (guest only)
 *   /dashboard           â†’ User dashboard (protected)
 *   /products            â†’ Product listing (public)
 *   /products/:id        â†’ Product detail (public)
 *   /cart                â†’ Shopping cart (public)
 *   /checkout            â†’ Checkout flow (protected)
 *   /admin/*             â†’ Admin panel (admin role only)
 *   *                    â†’ 404 Not Found
 *
 * Route Guards:
 *   <ProtectedRoute>    â†’ Redirects to /login if not authenticated
 *   <GuestRoute>        â†’ Redirects to /dashboard if already logged in
 *   <AdminRoute>        â†’ Redirects to /dashboard if not admin
 * ============================================================
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { GuestRoute } from '@/components/layout/GuestRoute';
import { AdminRoute } from '@/components/layout/AdminRoute';
import { MainLayout } from '@/components/layout/MainLayout';
import { PageLoader } from '@/components/ui/PageLoader';
import { CartPage } from './pages/CartPage';

// â”€â”€â”€ Lazy Loaded Pages â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// WHY lazy(): Code splitting â€” each page is a separate JS chunk.
// Users only download code for pages they actually visit.
// WHY Suspense: Shows fallback while the chunk loads.
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/auth/ForgotPasswordPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const OrderHistoryPage = lazy(() => import('@/pages/OrderHistoryPage'));
const ProductListPage = lazy(() => import('@/pages/products/ProductListPage'));
const ProductDetailPage = lazy(() => import('@/pages/products/ProductDetailPage'));
const CheckoutPage = lazy(() => import('@/pages/CheckoutPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminProductForm = lazy(() => import('@/pages/admin/AdminProductForm'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

export default function App() {
  useSocket();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* â”€â”€ Guest Only (redirect to /dashboard if logged in) â”€â”€ */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* â”€â”€ Public routes with main layout â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/products" element={<ProductListPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />

          {/* â”€â”€ Public Cart â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />

          {/* â”€â”€ Protected routes (login required) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/orders" element={<OrderHistoryPage />} />
          </Route>

          {/* â”€â”€ Public Cart â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <Route path="/cart" element={<CartPage />} />

          {/* â”€â”€ Admin routes (admin role required) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/products/new" element={<AdminProductForm />} />
            <Route path="/admin/products/:id/edit" element={<AdminProductForm />} />
            <Route path="/admin/*" element={<AdminDashboardPage />} />
          </Route>
        </Route>

        {/* â”€â”€ 404 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}

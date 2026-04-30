/**
 * ============================================================
 * React Entry Point — src/main.tsx
 * ============================================================
 * Provider hierarchy (outermost → innermost):
 *   1. Redux Provider         → Global state (auth, cart, UI)
 *   2. QueryClientProvider    → Server state cache (products, users)
 *   3. BrowserRouter          → URL routing
 *   4. App                    → Routes + layout
 *
 * WHY this order matters:
 *   - Redux must wrap everything so any component can access store
 *   - React Query must wrap routes so query hooks work in all pages
 *   - Router must wrap App to enable useNavigate/useParams hooks
 * ============================================================
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { store } from '@/store';
import { initializeAuth } from '@/store/slices/authSlice';
import App from './App';
import './index.css';

// ─── React Query Client Config ───────────────────────────────
// WHY these defaults:
//   staleTime: Don't refetch if data is less than 30s old
//   retry: Retry failed requests 1 time (not 3 — too slow for auth errors)
//   refetchOnWindowFocus: Refetch when user returns to the tab
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      retry: 1,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0, // Don't retry mutations (POST/PUT/DELETE)
    },
  },
});

async function enableMocking() {
  if (!import.meta.env.DEV) return;

  const { worker } = await import('@/test/mocks/browser');
  await worker.start({
    onUnhandledRequest: (request) => {
      const { pathname } = new URL(request.url);
      if (pathname.startsWith('/api/')) {
        // Keep visibility for API endpoints we forgot to mock.
        console.warn(`[MSW] Unhandled ${request.method} request to ${request.url}`);
      }
    },
  });
}

async function bootstrap() {
  await enableMocking();
  await store.dispatch(initializeAuth());

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      {/*
        WHY StrictMode:
        - Detects side effects by running effects twice in development
        - Warns about deprecated lifecycle methods
        - Helps surface bugs early — ONLY in development, no prod overhead
      */}
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <App />
            {/*
              WHY Toaster here (not in App):
              Toast notifications need to be at the top level so they
              render above all modals and overlays (z-index layer)
            */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: { maxWidth: '400px' },
                success: { duration: 3000 },
                error: { duration: 5000 },
              }}
            />
          </BrowserRouter>
        </QueryClientProvider>
      </Provider>
    </React.StrictMode>
  );
}

void bootstrap();

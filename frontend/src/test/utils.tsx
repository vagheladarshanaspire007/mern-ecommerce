/**
 * ============================================================
 * Test Utilities — src/test/utils.tsx
 * ============================================================
 * WHY a custom render wrapper:
 *   Components that use Redux hooks (useAppSelector) or React Query
 *   hooks need their Provider context.
 *   Without providers, every test would crash with context errors.
 *
 *   Instead of wrapping every test manually, this custom render
 *   function pre-wraps with all required providers.
 *
 * Usage:
 *   import { render, screen } from '@/test/utils';  ← use THIS, not from @testing-library
 *   render(<MyComponent />);
 *   render(<MyComponent />, { preloadedState: { auth: { user: mockUser } } });
 * ============================================================
 */

import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import authReducer from '@/store/slices/authSlice';
import cartReducer from '@/store/slices/cartSlice';
import uiReducer from '@/store/slices/uiSlice';
import type { RootState } from '@/store';

// ─── Test Store Factory ──────────────────────────────────────
// Creates a fresh store for each test — prevents state leaking between tests;
const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  ui: uiReducer,
});

export const createTestStore = (preloadedState?: Partial<RootState>) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
  });

// ─── Test Query Client ───────────────────────────────────────
// Disable retries in tests — failed queries should fail immediately
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });

// ─── Custom Render ───────────────────────────────────────────
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  initialEntries?: string[];
}

export function renderWithProviders(
  ui: ReactElement,
  { preloadedState, initialEntries = ['/'], ...renderOptions }: CustomRenderOptions = {}
) {
  const store = createTestStore(preloadedState);
  const queryClient = createTestQueryClient();

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
        </QueryClientProvider>
      </Provider>
    );
  }

  return {
    store,
    queryClient,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

// ─── Mock Data Factories ─────────────────────────────────────
// WHY factories: Centralized mock data. When User type changes, fix it here.

export const mockUser = {
  id: 'user-123',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  role: 'user' as const,
  emailVerified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const mockAdmin = { ...mockUser, id: 'admin-123', role: 'admin' as const };

export const mockProduct = {
  id: 'prod-123',
  name: 'Test Product',
  description: 'A test product',
  price: 29.99,
  stock: 100,
  imageUrls: ['https://example.com/image.jpg'],
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Re-export everything from testing-library for convenience
export * from '@testing-library/react';
export { renderWithProviders as render };

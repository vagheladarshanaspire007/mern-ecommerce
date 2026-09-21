import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import ProductListPage from '../ProductListPage';
import authReducer from '@/store/slices/authSlice';
import cartReducer from '@/store/slices/cartSlice';
import uiReducer from '@/store/slices/uiSlice';

const createTestStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      cart: cartReducer,
      ui: uiReducer,
    },
  });

const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

const renderProductListPage = () => {
  const store = createTestStore();
  const queryClient = createQueryClient();

  return {
    store,
    queryClient,
    ...render(
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/products']}>
            <ProductListPage />
          </MemoryRouter>
        </QueryClientProvider>
      </Provider>
    ),
  };
};

describe('ProductListPage', () => {
  it('renders skeleton loading state while products are loading', () => {
    renderProductListPage();

    expect(screen.getByLabelText('Loading products')).toBeInTheDocument();
  });

  it('renders the product grid after products load successfully', async () => {
    renderProductListPage();

    expect(await screen.findByText('Wireless Headphones')).toBeInTheDocument();
    expect(screen.getByText('Mechanical Keyboard')).toBeInTheDocument();
    expect(screen.getByText('Wireless Mouse')).toBeInTheDocument();
  });

  it('triggers a debounced product search after typing in the search input', async () => {
    const user = userEvent.setup();

    renderProductListPage();

    const searchInput = screen.getByPlaceholderText('Search products...');

    await user.clear(searchInput);
    await user.type(searchInput, 'keyboard');

    await waitFor(
      () => {
        expect(searchInput).toHaveValue('keyboard');
      },
      { timeout: 1000 }
    );

    await new Promise((resolve) => setTimeout(resolve, 350));

    await waitFor(() => {
      expect(screen.getByText('Mechanical Keyboard')).toBeInTheDocument();
    });
  });
});

import { delay, http, HttpResponse } from 'msw';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { server } from '@/mocks/server';
import ProductListPage from '@/pages/products/ProductListPage';
import { render, screen, waitFor } from '@/test/utils';

function mockProductsHandlers(capturedSearches?: string[], responseDelayMs = 200) {
  server.use(
    http.get('*/api/v1/products/categories', async () =>
      HttpResponse.json({
        success: true,
        data: [
          {
            id: 'cat-1',
            name: 'Electronics',
          },
        ],
      })
    ),
    http.get('*/api/v1/products', async ({ request }) => {
      const url = new URL(request.url);
      capturedSearches?.push(url.searchParams.get('search') ?? '');
      await delay(responseDelayMs);

      return HttpResponse.json({
        success: true,
        data: [
          {
            id: 'p-1',
            name: 'Wireless Keyboard',
            description: 'Low profile keyboard',
            price: 2499,
            stock: 12,
            imageUrls: ['https://example.com/keyboard.png'],
            images: [],
            averageRating: 0,
            reviewCount: 0,
            reviews: [],
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
        pagination: {
          nextCursor: null,
          hasMore: false,
        },
      });
    })
  );
}

describe('ProductListPage', () => {
  it('shows loading state while products are being fetched', async () => {
    mockProductsHandlers();

    render(<ProductListPage />);

    expect(screen.getByText(/loading products/i)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /add wireless keyboard to cart/i })
    ).not.toBeInTheDocument();

    expect(await screen.findByRole('heading', { name: /wireless keyboard/i })).toBeInTheDocument();
  });

  it('renders product grid on successful API response', async () => {
    mockProductsHandlers();

    render(<ProductListPage />);

    expect(await screen.findByRole('heading', { name: /wireless keyboard/i })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /add wireless keyboard to cart/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/1 items/i)).toBeInTheDocument();
  });

  it('search input triggers a debounced query', async () => {
    const capturedSearches: string[] = [];
    mockProductsHandlers(capturedSearches, 0);

    const user = userEvent.setup();
    render(<ProductListPage />);

    await user.type(screen.getByRole('searchbox', { name: /search products/i }), 'mouse');

    await waitFor(() => {
      expect(capturedSearches).toContain('mouse');
    });
  });
});

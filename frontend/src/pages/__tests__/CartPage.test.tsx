import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import CartPage from '@/pages/CartPage';
import { render, screen } from '@/test/utils';

describe('CartPage', () => {
  it('renders items from preloaded Redux state', () => {
    render(<CartPage />, {
      preloadedState: {
        cart: {
          items: [
            {
              productId: 'p-1',
              name: 'Laptop',
              price: 50000,
              quantity: 2,
              stock: 5,
              imageUrl: 'https://example.com/laptop.png',
            },
          ],
        },
      },
    });

    expect(screen.getByRole('heading', { name: /your cart/i })).toBeInTheDocument();
    expect(screen.getByText(/laptop/i)).toBeInTheDocument();
    expect(screen.getByText(/₹50,000\.00/i)).toBeInTheDocument();
  });

  it('clicking remove dispatches correct action by removing the item', async () => {
    const user = userEvent.setup();
    const { store } = render(<CartPage />, {
      preloadedState: {
        cart: {
          items: [
            {
              productId: 'p-1',
              name: 'Laptop',
              price: 50000,
              quantity: 1,
              stock: 5,
              imageUrl: 'https://example.com/laptop.png',
            },
          ],
        },
      },
    });

    await user.click(screen.getByRole('button', { name: /remove/i }));

    expect(store.getState().cart.items).toEqual([]);
  });

  it('renders empty state when cart is empty', () => {
    render(<CartPage />, {
      preloadedState: {
        cart: {
          items: [],
        },
      },
    });

    expect(screen.getByRole('heading', { name: /your cart is empty/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /continue shopping/i })).toBeInTheDocument();
  });
});

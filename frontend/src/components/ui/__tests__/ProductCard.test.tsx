import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import ProductCard from '@/components/ui/ProductCard';
import { render, screen } from '@/test/utils';
import type { Product } from '@/types/auth.types';

const product: Product = {
  id: 'p-1',
  name: 'Gaming Mouse',
  description: 'Ergonomic wireless mouse',
  price: 1999,
  stock: 3,
  imageUrls: ['https://example.com/mouse.png'],
  images: [{ id: 'img-1', url: 'https://example.com/mouse.png', alt: 'Gaming Mouse' }],
  averageRating: 0,
  reviewCount: 0,
  reviews: [],
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('ProductCard', () => {
  it('displays product name, price, and stock status', () => {
    render(<ProductCard product={product} />);

    expect(screen.getByRole('heading', { name: /gaming mouse/i })).toBeInTheDocument();
    expect(screen.getByText(/₹1,999\.00/i)).toBeInTheDocument();
    expect(screen.getByText(/in stock/i)).toBeInTheDocument();
  });

  it('clicking Add to Cart dispatches addToCart with correct payload', async () => {
    const user = userEvent.setup();
    const { store } = render(<ProductCard product={product} />);

    await user.click(screen.getByRole('button', { name: /add gaming mouse to cart/i }));

    expect(store.getState().cart.items).toEqual([
      {
        productId: 'p-1',
        name: 'Gaming Mouse',
        price: 1999,
        quantity: 1,
        imageUrl: 'https://example.com/mouse.png',
        stock: 3,
      },
    ]);
  });
});

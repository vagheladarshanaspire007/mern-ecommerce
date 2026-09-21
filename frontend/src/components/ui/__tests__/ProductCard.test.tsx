import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import authReducer from '@/store/slices/authSlice';
import cartReducer from '@/store/slices/cartSlice';
import uiReducer from '@/store/slices/uiSlice';
import type { Product } from '@/services/product.service';
import { ProductCard } from '../ProductCard';

const product: Product = {
  id: 'product-1',
  name: 'Wireless Headphones',
  description: 'High-quality wireless headphones',
  price: '2999',
  stock: 25,
  imageUrls: ['/images/headphones.jpg'],
  isActive: true,
  categoryId: 'category-1',
  categoryName: 'Electronics',
  averageRating: 4.5,
  reviewCount: 10,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const createStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      cart: cartReducer,
      ui: uiReducer,
    },
  });

const renderProductCard = () => {
  const store = createStore();

  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter>
          <ProductCard product={product} />
        </MemoryRouter>
      </Provider>
    ),
  };
};

describe('ProductCard', () => {
  it('displays product information', () => {
    renderProductCard();

    expect(screen.getByText('Wireless Headphones')).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('₹2999.00')).toBeInTheDocument();
    expect(screen.getByText('In stock')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument();
  });

  it('dispatches the correct payload when Add to Cart is clicked', async () => {
    const user = userEvent.setup();
    const store = createStore();
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    render(
      <Provider store={store}>
        <MemoryRouter>
          <ProductCard product={product} />
        </MemoryRouter>
      </Provider>
    );

    await user.click(screen.getByRole('button', { name: /add to cart/i }));

    expect(dispatchSpy).toHaveBeenCalledWith({
      type: 'cart/addToCart',
      payload: {
        productId: 'product-1',
        name: 'Wireless Headphones',
        price: 2999,
        imageUrl: '/images/headphones.jpg',
        stock: 25,
      },
    });
  });
});

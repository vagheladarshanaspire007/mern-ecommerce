import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import authReducer from '@/store/slices/authSlice';
import cartReducer, { type CartItem } from '@/store/slices/cartSlice';
import uiReducer from '@/store/slices/uiSlice';
import { CartPage } from '../CartPage';

const cartItems: CartItem[] = [
  {
    productId: 'product-1',
    name: 'Wireless Headphones',
    price: 2999,
    quantity: 2,
    stock: 10,
    imageUrl: '/images/headphones.jpg',
  },
  {
    productId: 'product-2',
    name: 'Mechanical Keyboard',
    price: 4999,
    quantity: 1,
    stock: 5,
    imageUrl: '/images/keyboard.jpg',
  },
];

const createStore = (items: CartItem[] = []) =>
  configureStore({
    reducer: {
      auth: authReducer,
      cart: cartReducer,
      ui: uiReducer,
    },
    preloadedState: {
      auth: authReducer(undefined, { type: 'init' }),
      cart: {
        items,
        isOpen: false,
      },
      ui: uiReducer(undefined, { type: 'init' }),
    },
  });

const renderCartPage = (items: CartItem[] = []) => {
  const store = createStore(items);

  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/cart']}>
          <Routes>
            <Route path="/cart" element={<CartPage />} />
            <Route path="/products" element={<div>Products Page</div>} />
            <Route path="/checkout" element={<div>Checkout Page</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    ),
  };
};

describe('CartPage', () => {
  it('renders cart items from preloaded Redux state', () => {
    renderCartPage(cartItems);

    expect(screen.getByRole('heading', { name: /shopping cart/i })).toBeInTheDocument();
    expect(screen.getByText('Wireless Headphones')).toBeInTheDocument();
    expect(screen.getByText('Mechanical Keyboard')).toBeInTheDocument();
    expect(screen.getByText('₹2999.00 × 2')).toBeInTheDocument();
    expect(screen.getByText('₹4999.00 × 1')).toBeInTheDocument();
  });

  it('removes an item when the remove button is clicked', async () => {
    const user = userEvent.setup();
    const { store } = renderCartPage(cartItems);

    const removeButton = screen.getByRole('button', {
      name: 'Remove Wireless Headphones from cart',
    });

    await user.click(removeButton);

    expect(store.getState().cart.items).toEqual([cartItems[1]]);
    expect(screen.queryByText('Wireless Headphones')).not.toBeInTheDocument();
    expect(screen.getByText('Mechanical Keyboard')).toBeInTheDocument();
  });

  it('renders the empty cart state when there are no items', () => {
    renderCartPage();

    expect(screen.getByText('Your cart is empty')).toBeInTheDocument();
    expect(
      screen.getByText('Add some products to your cart to continue shopping.')
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /continue shopping/i })).toBeInTheDocument();
  });
});

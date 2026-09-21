import { describe, expect, it } from 'vitest';

import cartReducer, {
  addToCart,
  clearCart,
  hydrateCart,
  removeFromCart,
  selectCartItemCount,
  selectCartItems,
  selectCartTotal,
  toggleCart,
  updateQuantity,
  type CartItem,
} from '../cartSlice';

const product: Omit<CartItem, 'quantity'> = {
  productId: 'product-1',
  name: 'Wireless Headphones',
  price: 2999,
  stock: 10,
  imageUrl: '/images/headphones.jpg',
};

const secondProduct: Omit<CartItem, 'quantity'> = {
  productId: 'product-2',
  name: 'Mechanical Keyboard',
  price: 4999,
  stock: 5,
  imageUrl: '/images/keyboard.jpg',
};

describe('cartSlice', () => {
  it('adds a new product to the cart', () => {
    const state = cartReducer(undefined, addToCart(product));

    expect(selectCartItems({ cart: state })).toEqual([
      {
        ...product,
        quantity: 1,
      },
    ]);
  });

  it('does not add an out-of-stock product', () => {
    const outOfStockProduct: Omit<CartItem, 'quantity'> = {
      ...product,
      stock: 0,
    };

    const state = cartReducer(undefined, addToCart(outOfStockProduct));

    expect(state.items).toEqual([]);
  });

  it('increments quantity when adding an existing item', () => {
    let state = cartReducer(undefined, addToCart(product));

    state = cartReducer(state, addToCart(product));

    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(2);
  });

  it('does not increment an item beyond available stock', () => {
    const limitedProduct: Omit<CartItem, 'quantity'> = {
      ...product,
      stock: 1,
    };

    let state = cartReducer(undefined, addToCart(limitedProduct));

    state = cartReducer(state, addToCart(limitedProduct));

    expect(state.items[0].quantity).toBe(1);
  });

  it('removes an item with removeFromCart', () => {
    const state = cartReducer(undefined, addToCart(product));

    const updatedState = cartReducer(state, removeFromCart(product.productId));

    expect(updatedState.items).toEqual([]);
  });

  it('updates an existing item quantity to a positive value', () => {
    const state = cartReducer(undefined, addToCart(product));

    const updatedState = cartReducer(
      state,
      updateQuantity({
        productId: product.productId,
        quantity: 5,
      })
    );

    expect(updatedState.items[0].quantity).toBe(5);
  });

  it('removes an item when quantity is zero', () => {
    const state = cartReducer(undefined, addToCart(product));

    const updatedState = cartReducer(
      state,
      updateQuantity({
        productId: product.productId,
        quantity: 0,
      })
    );

    expect(updatedState.items).toEqual([]);
  });

  it('does nothing when updating a non-existent item', () => {
    const state = cartReducer(undefined, addToCart(product));

    const updatedState = cartReducer(
      state,
      updateQuantity({
        productId: 'missing-product',
        quantity: 5,
      })
    );

    expect(updatedState.items).toEqual(state.items);
  });

  it('calculates the cart total correctly', () => {
    let state = cartReducer(undefined, addToCart(product));

    state = cartReducer(state, addToCart(secondProduct));

    state = cartReducer(
      state,
      updateQuantity({
        productId: product.productId,
        quantity: 2,
      })
    );

    expect(selectCartTotal({ cart: state })).toBe(10997);
  });

  it('returns zero for an empty cart total', () => {
    const state = cartReducer(undefined, { type: 'unknown' });

    expect(selectCartTotal({ cart: state })).toBe(0);
  });

  it('calculates total item count', () => {
    let state = cartReducer(undefined, addToCart(product));

    state = cartReducer(
      state,
      updateQuantity({
        productId: product.productId,
        quantity: 3,
      })
    );

    state = cartReducer(state, addToCart(secondProduct));

    expect(selectCartItemCount({ cart: state })).toBe(4);
  });

  it('clears all cart items with clearCart', () => {
    let state = cartReducer(undefined, addToCart(product));

    state = cartReducer(state, addToCart(secondProduct));

    const clearedState = cartReducer(state, clearCart());

    expect(clearedState.items).toEqual([]);
  });

  it('hydrates the cart with provided items', () => {
    const items: CartItem[] = [
      {
        ...product,
        quantity: 3,
      },
    ];

    const state = cartReducer(undefined, hydrateCart(items));

    expect(state.items).toEqual(items);
  });

  it('toggles cart open and closed', () => {
    let state = cartReducer(undefined, toggleCart());

    expect(state.isOpen).toBe(true);

    state = cartReducer(state, toggleCart());

    expect(state.isOpen).toBe(false);
  });
});

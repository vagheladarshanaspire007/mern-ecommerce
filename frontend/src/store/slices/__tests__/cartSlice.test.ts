import { afterEach, describe, expect, it, vi } from 'vitest';

import cartReducer, {
  addToCart,
  clearCart,
  persistCartItems,
  removeFromCart,
  selectCartItemCount,
  selectCartItems,
  selectCartTotal,
  updateQuantity,
  type CartItem,
} from '@/store/slices/cartSlice';

type CartStateShape = { cart: { items: CartItem[] } };

describe('cartSlice', () => {
  afterEach(() => {
    globalThis.localStorage.clear();
    vi.restoreAllMocks();
    vi.resetModules();
  });

  const baseItem = {
    productId: 'p-1',
    name: 'Keyboard',
    price: 1200,
    stock: 5,
    imageUrl: 'https://example.com/keyboard.png',
  };

  it('addToCart adds new item', () => {
    const nextState = cartReducer({ items: [] }, addToCart(baseItem));

    expect(nextState.items).toHaveLength(1);
    expect(nextState.items[0]).toMatchObject({ ...baseItem, quantity: 1 });
  });

  it('addToCart increments quantity when item already exists', () => {
    const state = {
      items: [{ ...baseItem, quantity: 1 }],
    };

    const nextState = cartReducer(state, addToCart(baseItem));

    expect(nextState.items[0].quantity).toBe(2);
  });

  it('addToCart does not exceed stock when item already reached limit', () => {
    const state = {
      items: [{ ...baseItem, quantity: 5 }],
    };

    const nextState = cartReducer(state, addToCart(baseItem));

    expect(nextState.items[0].quantity).toBe(5);
  });

  it('addToCart refreshes existing item details from the latest payload', () => {
    const state = {
      items: [{ ...baseItem, quantity: 1 }],
    };

    const nextState = cartReducer(
      state,
      addToCart({
        ...baseItem,
        name: 'Mechanical Keyboard',
        price: 1500,
        stock: 8,
        imageUrl: 'https://example.com/keyboard-v2.png',
      })
    );

    expect(nextState.items[0]).toMatchObject({
      name: 'Mechanical Keyboard',
      price: 1500,
      stock: 8,
      imageUrl: 'https://example.com/keyboard-v2.png',
      quantity: 2,
    });
  });

  it('removeFromCart removes item completely', () => {
    const state = {
      items: [
        { ...baseItem, quantity: 2 },
        { productId: 'p-2', name: 'Mouse', price: 800, quantity: 1, stock: 2 },
      ],
    };

    const nextState = cartReducer(state, removeFromCart('p-1'));

    expect(nextState.items).toEqual([
      { productId: 'p-2', name: 'Mouse', price: 800, quantity: 1, stock: 2 },
    ]);
  });

  it('updateQuantity with 0 keeps minimum quantity 1', () => {
    const state = {
      items: [{ ...baseItem, quantity: 2 }],
    };

    const nextState = cartReducer(state, updateQuantity({ productId: 'p-1', quantity: 0 }));

    expect(nextState.items[0].quantity).toBe(1);
  });

  it('updateQuantity caps quantity at available stock', () => {
    const state = {
      items: [{ ...baseItem, quantity: 1 }],
    };

    const nextState = cartReducer(state, updateQuantity({ productId: 'p-1', quantity: 99 }));

    expect(nextState.items[0].quantity).toBe(5);
  });

  it('updateQuantity ignores unknown items', () => {
    const state = {
      items: [{ ...baseItem, quantity: 1 }],
    };

    const nextState = cartReducer(state, updateQuantity({ productId: 'missing', quantity: 3 }));

    expect(nextState).toEqual(state);
  });

  it('selectCartTotal calculates correct total', () => {
    const state: CartStateShape = {
      cart: {
        items: [
          { ...baseItem, quantity: 2 },
          { productId: 'p-2', name: 'Mouse', price: 500, quantity: 3, stock: 10 },
        ],
      },
    };

    expect(selectCartTotal(state)).toBe(3900);
  });

  it('selectCartItems returns cart items', () => {
    const state: CartStateShape = {
      cart: {
        items: [{ ...baseItem, quantity: 2 }],
      },
    };

    expect(selectCartItems(state)).toEqual([{ ...baseItem, quantity: 2 }]);
  });

  it('selectCartItemCount returns combined quantity', () => {
    const state: CartStateShape = {
      cart: {
        items: [
          { ...baseItem, quantity: 2 },
          { productId: 'p-2', name: 'Mouse', price: 500, quantity: 3, stock: 10 },
        ],
      },
    };

    expect(selectCartItemCount(state)).toBe(5);
  });

  it('clearCart empties cart state', () => {
    const state = {
      items: [{ ...baseItem, quantity: 2 }],
    };

    const nextState = cartReducer(state, clearCart());

    expect(nextState.items).toEqual([]);
  });

  it('persistCartItems stores items in localStorage', () => {
    const items = [{ ...baseItem, quantity: 2 }];

    persistCartItems(items);

    expect(globalThis.localStorage.getItem('cart')).toBe(JSON.stringify(items));
  });

  it('persistCartItems removes localStorage entry when items are empty', () => {
    globalThis.localStorage.setItem('cart', JSON.stringify([{ ...baseItem, quantity: 2 }]));

    persistCartItems([]);

    expect(globalThis.localStorage.getItem('cart')).toBeNull();
  });

  it('persistCartItems swallows localStorage write errors', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage unavailable');
    });

    expect(() => persistCartItems([{ ...baseItem, quantity: 1 }])).not.toThrow();
    expect(setItemSpy).toHaveBeenCalled();
  });

  it('loads valid cart items from localStorage on module init', async () => {
    globalThis.localStorage.setItem('cart', JSON.stringify([{ ...baseItem, quantity: 2 }]));

    const module = await import('@/store/slices/cartSlice');

    const nextState = module.default(undefined, { type: 'unknown' });

    expect(nextState.items).toEqual([{ ...baseItem, quantity: 2 }]);
  });

  it('ignores malformed or invalid localStorage cart data on module init', async () => {
    globalThis.localStorage.setItem(
      'cart',
      JSON.stringify([{ ...baseItem, quantity: 2 }, { invalid: true }])
    );

    const module = await import('@/store/slices/cartSlice');
    const nextState = module.default(undefined, { type: 'unknown' });

    expect(nextState.items).toEqual([{ ...baseItem, quantity: 2 }]);
  });

  it('falls back to an empty cart when localStorage contains invalid JSON', async () => {
    globalThis.localStorage.setItem('cart', '{invalid-json');

    const module = await import('@/store/slices/cartSlice');
    const nextState = module.default(undefined, { type: 'unknown' });

    expect(nextState.items).toEqual([]);
  });
});

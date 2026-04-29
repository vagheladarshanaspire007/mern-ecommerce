import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const CART_STORAGE_KEY = 'cart';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  imageUrl?: string;
}

interface CartState {
  items: CartItem[];
}

function loadCartFromStorage(): CartItem[] {
  if (typeof globalThis.window === 'undefined') return [];

  try {
    const raw = globalThis.window.localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is CartItem =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as CartItem).productId === 'string' &&
        typeof (item as CartItem).name === 'string' &&
        typeof (item as CartItem).price === 'number' &&
        typeof (item as CartItem).quantity === 'number' &&
        typeof (item as CartItem).stock === 'number' &&
        typeof (item as CartItem).imageUrl === 'string'
    );
  } catch {
    return [];
  }
}

export function persistCartItems(items: CartItem[]) {
  if (typeof globalThis.window === 'undefined') return;

  try {
    if (items.length === 0) {
      globalThis.window.localStorage.removeItem(CART_STORAGE_KEY);
      return;
    }
    globalThis.window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore write errors (private mode/storage limits)
  }
}

const initialState: CartState = { items: loadCartFromStorage() };

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<Omit<CartItem, 'quantity'>>) => {
      const existing = state.items.find((i) => i.productId === action.payload.productId);
      if (existing) {
        existing.stock = action.payload.stock;
        existing.imageUrl = action.payload.imageUrl;
        existing.price = action.payload.price;
        existing.name = action.payload.name;
        if (existing.quantity < existing.stock) {
          existing.quantity += 1;
        }
      } else {
        state.items.push({ ...action.payload, quantity: 1 });
      }
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((i) => i.productId !== action.payload);
    },

    updateQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const item = state.items.find((i) => i.productId === action.payload.productId);
      if (item) {
        const nextQuantity = Math.max(1, Math.min(action.payload.quantity, item.stock));
        item.quantity = nextQuantity;
      }
    },

    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;

export const selectCartItems = (state: { cart: CartState }) => state.cart.items;

export const selectCartItemCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);

export const selectCartTotal = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export default cartSlice.reducer;

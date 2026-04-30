/**
 * Cart Slice — src/store/slices/cartSlice.ts
 * Day 42: Implement full cart functionality here.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

const initialState: CartState = {
  items: [],
  isOpen: false,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    /**
     * Add item or increment quantity if already in cart.
     * WHY Immer: We write state.items.push() — looks mutating but RTK + Immer
     * creates a new immutable state behind the scenes.
     */
    addToCart: (state, action: PayloadAction<Omit<CartItem, 'quantity'>>) => {
      const existing = state.items.find((i) => i.productId === action.payload.productId);
      if (existing) {
        existing.quantity += 1;
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
        if (action.payload.quantity <= 0) {
          state.items = state.items.filter((i) => i.productId !== action.payload.productId);
        } else {
          item.quantity = action.payload.quantity;
        }
      }
    },

    clearCart: (state) => {
      state.items = [];
    },

    toggleCart: (state) => {
      state.isOpen = !state.isOpen;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, toggleCart } =
  cartSlice.actions;

// ─── Selectors ───────────────────────────────────────────────
// WHY selectors: Encapsulate derived state — components don't compute totals
export const selectCartItemCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);

export const selectCartTotal = (state: { cart: CartState }) =>
  state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

export default cartSlice.reducer;

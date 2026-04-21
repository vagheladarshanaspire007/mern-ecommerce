/**
 * ============================================================
 * Redux Store — src/store/index.ts
 * ============================================================
 * WHY Redux Toolkit (RTK) over plain Redux:
 *   - createSlice() eliminates boilerplate (no action creators/types)
 *   - Immer built-in → write "mutating" code that's actually immutable
 *   - createAsyncThunk → standardized async patterns
 *   - RTK Query → data fetching + caching (replaces much of react-query)
 *
 * Store slices:
 *   auth     → User identity, tokens, login state
 *   cart     → Shopping cart items (Day 42)
 *   ui       → Modal open/close, sidebar, loading overlays
 *
 * WHY keep server state in React Query, not Redux:
 *   Redux is great for UI state and user session.
 *   React Query handles server state better: caching, invalidation,
 *   background refetching, deduplication. Don't fight the right tool.
 * ============================================================
 */

import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import uiReducer from './slices/uiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // WHY serializableCheck warning:
      // Redux warns if you put non-serializable values (Date, Function, Map) in state.
      // Everything in the store must be JSON-serializable for Redux DevTools + persistence.
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: import.meta.env.DEV, // WHY: Only expose DevTools in development
});

// ─── Types ───────────────────────────────────────────────────
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ─── Typed Hooks ─────────────────────────────────────────────
// WHY typed hooks: useDispatch/useSelector don't know your store's shape.
// These typed versions give you autocomplete and type safety.
// Import THESE hooks (not the plain react-redux ones) throughout the app.
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

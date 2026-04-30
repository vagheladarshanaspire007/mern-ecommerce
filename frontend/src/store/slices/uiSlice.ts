/**
 * UI Slice — src/store/slices/uiSlice.ts
 * Controls global UI state: modals, sidebar, loading overlays.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  isSidebarOpen: boolean;
  activeModal: string | null;
  isGlobalLoading: boolean;
  unreadCount: number;
  isSocketConnected: boolean;
}

const initialState: UIState = {
  isSidebarOpen: false,
  activeModal: null,
  isGlobalLoading: false,
  unreadCount: 0,
  isSocketConnected: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    openModal: (state, action: PayloadAction<string>) => {
      state.activeModal = action.payload;
    },
    closeModal: (state) => {
      state.activeModal = null;
    },
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.isGlobalLoading = action.payload;
    },
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    },
    clearUnreadCount: (state) => {
      state.unreadCount = 0;
    },
    setSocketConnected: (state, action: PayloadAction<boolean>) => {
      state.isSocketConnected = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  openModal,
  closeModal,
  setGlobalLoading,
  incrementUnreadCount,
  clearUnreadCount,
  setSocketConnected,
} = uiSlice.actions;
export default uiSlice.reducer;

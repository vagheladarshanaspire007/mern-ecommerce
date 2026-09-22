import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

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
    toggleSidebar(state) {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.isSidebarOpen = action.payload;
    },
    setActiveModal(state, action: PayloadAction<string | null>) {
      state.activeModal = action.payload;
    },
    openModal(state, action: PayloadAction<string>) {
      state.activeModal = action.payload;
    },
    closeModal(state) {
      state.activeModal = null;
    },
    setGlobalLoading(state, action: PayloadAction<boolean>) {
      state.isGlobalLoading = action.payload;
    },
    incrementUnreadCount(state) {
      state.unreadCount += 1;
    },
    clearUnreadCount(state) {
      state.unreadCount = 0;
    },
    setSocketConnected(state, action: PayloadAction<boolean>) {
      state.isSocketConnected = action.payload;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setActiveModal,
  openModal,
  closeModal,
  setGlobalLoading,
  incrementUnreadCount,
  clearUnreadCount,
  setSocketConnected,
} = uiSlice.actions;

export default uiSlice.reducer;

/**
 * UI Slice — src/store/slices/uiSlice.ts
 * Controls global UI state: modals, sidebar, loading overlays.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  isSidebarOpen: boolean;
  activeModal: string | null;
  isGlobalLoading: boolean;
}

const initialState: UIState = {
  isSidebarOpen: false,
  activeModal: null,
  isGlobalLoading: false,
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
  },
});

export const { toggleSidebar, openModal, closeModal, setGlobalLoading } = uiSlice.actions;
export default uiSlice.reducer;

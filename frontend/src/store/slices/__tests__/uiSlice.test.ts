import { describe, expect, it } from 'vitest';

import uiReducer, {
  clearUnreadCount,
  closeModal,
  incrementUnreadCount,
  openModal,
  setGlobalLoading,
  setSocketConnected,
  toggleSidebar,
} from '@/store/slices/uiSlice';

describe('uiSlice', () => {
  it('returns the initial state', () => {
    expect(uiReducer(undefined, { type: 'unknown' })).toEqual({
      isSidebarOpen: false,
      activeModal: null,
      isGlobalLoading: false,
      unreadCount: 0,
      isSocketConnected: false,
    });
  });

  it('toggleSidebar flips sidebar visibility', () => {
    const openedState = uiReducer(undefined, toggleSidebar());
    const closedState = uiReducer(openedState, toggleSidebar());

    expect(openedState.isSidebarOpen).toBe(true);
    expect(closedState.isSidebarOpen).toBe(false);
  });

  it('openModal and closeModal manage active modal state', () => {
    const openedState = uiReducer(undefined, openModal('cart'));
    const closedState = uiReducer(openedState, closeModal());

    expect(openedState.activeModal).toBe('cart');
    expect(closedState.activeModal).toBeNull();
  });

  it('setGlobalLoading updates the loading flag', () => {
    expect(uiReducer(undefined, setGlobalLoading(true)).isGlobalLoading).toBe(true);
  });

  it('incrementUnreadCount and clearUnreadCount manage unread count', () => {
    const incrementedState = uiReducer(undefined, incrementUnreadCount());
    const clearedState = uiReducer(incrementedState, clearUnreadCount());

    expect(incrementedState.unreadCount).toBe(1);
    expect(clearedState.unreadCount).toBe(0);
  });

  it('setSocketConnected updates socket connection state', () => {
    expect(uiReducer(undefined, setSocketConnected(true)).isSocketConnected).toBe(true);
  });
});

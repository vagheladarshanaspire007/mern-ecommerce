import { describe, expect, it } from 'vitest';

import uiReducer, { closeModal, openModal, setGlobalLoading, toggleSidebar } from '../uiSlice';

describe('uiSlice', () => {
  it('toggles sidebar open and closed', () => {
    let state = uiReducer(undefined, { type: 'init' });

    expect(state.isSidebarOpen).toBe(false);

    state = uiReducer(state, toggleSidebar());
    expect(state.isSidebarOpen).toBe(true);

    state = uiReducer(state, toggleSidebar());
    expect(state.isSidebarOpen).toBe(false);
  });

  it('opens a modal with the provided name', () => {
    const state = uiReducer(undefined, openModal('delete-product'));

    expect(state.activeModal).toBe('delete-product');
  });

  it('closes the active modal', () => {
    let state = uiReducer(undefined, openModal('delete-product'));

    state = uiReducer(state, closeModal());

    expect(state.activeModal).toBeNull();
  });

  it('sets global loading state', () => {
    let state = uiReducer(undefined, setGlobalLoading(true));

    expect(state.isGlobalLoading).toBe(true);

    state = uiReducer(state, setGlobalLoading(false));

    expect(state.isGlobalLoading).toBe(false);
  });
});

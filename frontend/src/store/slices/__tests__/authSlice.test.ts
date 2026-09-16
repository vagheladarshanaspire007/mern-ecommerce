import { beforeEach, describe, expect, it, vi } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';

import authReducer, {
  clearError,
  initializeAuth,
  loginUser,
  logoutUser,
  registerUser,
  setAccessToken,
} from '../authSlice';

import { authService } from '@/services/auth.service';

vi.mock('@/services/auth.service', () => ({
  authService: {
    refresh: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
}));

const mockUser = {
  id: 'user-1',
  firstName: 'Bhoomi',
  lastName: 'Test',
  email: 'test@example.com',
  role: 'user' as const,
  emailVerified: true,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const credentials = {
  email: 'test@example.com',
  password: 'Password123',
};

const registerData = {
  firstName: 'Bhoomi',
  lastName: 'Test',
  email: 'newuser@example.com',
  password: 'Password123',
  confirmPassword: 'Password123',
};

const createStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
    },
  });

describe('authSlice', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the initial state', () => {
    const state = authReducer(undefined, { type: 'unknown' });

    expect(state).toEqual({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,
    });
  });

  it('sets the access token', () => {
    const state = authReducer(undefined, setAccessToken('new-access-token'));

    expect(state.accessToken).toBe('new-access-token');
  });

  it('clears an authentication error', () => {
    const state = authReducer(
      {
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: false,
        error: 'Something went wrong',
      },
      clearError()
    );

    expect(state.error).toBeNull();
  });

  it('handles initializeAuth success', async () => {
    vi.mocked(authService.refresh).mockResolvedValue({
      user: mockUser,
      accessToken: 'refresh-access-token',
    });

    const store = createStore();

    const result = await store.dispatch(initializeAuth());

    expect(result.type).toBe('auth/initialize/fulfilled');
    expect(authService.refresh).toHaveBeenCalledTimes(1);

    const state = store.getState().auth;

    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toBe('refresh-access-token');
    expect(state.isAuthenticated).toBe(true);
    expect(state.isInitialized).toBe(true);
  });

  it('handles initializeAuth rejection', async () => {
    vi.mocked(authService.refresh).mockRejectedValue(new Error('No session'));

    const store = createStore();

    const result = await store.dispatch(initializeAuth());

    expect(result.type).toBe('auth/initialize/rejected');
    expect(authService.refresh).toHaveBeenCalledTimes(1);

    const state = store.getState().auth;

    expect(state.isInitialized).toBe(true);
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.accessToken).toBeNull();
  });

  it('handles login pending state', () => {
    const state = authReducer(undefined, loginUser.pending('request-login-pending', credentials));

    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('handles login success', async () => {
    vi.mocked(authService.login).mockResolvedValue({
      user: mockUser,
      accessToken: 'login-access-token',
    });

    const store = createStore();

    const result = await store.dispatch(loginUser(credentials));

    expect(result.type).toBe('auth/login/fulfilled');
    expect(authService.login).toHaveBeenCalledWith(credentials);

    const state = store.getState().auth;

    expect(state.isLoading).toBe(false);
    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toBe('login-access-token');
    expect(state.isAuthenticated).toBe(true);
    expect(state.error).toBeNull();
  });

  it('handles login rejection with an error message', async () => {
    vi.mocked(authService.login).mockRejectedValue(new Error('Invalid email or password'));

    const store = createStore();

    const result = await store.dispatch(loginUser(credentials));

    expect(result.type).toBe('auth/login/rejected');

    const state = store.getState().auth;

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Invalid email or password');
    expect(state.isAuthenticated).toBe(false);
  });

  it('handles login rejection with a fallback message for non-Error values', async () => {
    vi.mocked(authService.login).mockRejectedValue('login failed');

    const store = createStore();

    const result = await store.dispatch(loginUser(credentials));

    expect(result.type).toBe('auth/login/rejected');

    const state = store.getState().auth;

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Login failed');
  });

  it('handles register pending state', () => {
    const state = authReducer(
      undefined,
      registerUser.pending('request-register-pending', registerData)
    );

    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('handles register success', async () => {
    vi.mocked(authService.register).mockResolvedValue({
      user: mockUser,
      accessToken: 'register-access-token',
    });

    const store = createStore();

    const result = await store.dispatch(registerUser(registerData));

    expect(result.type).toBe('auth/register/fulfilled');
    expect(authService.register).toHaveBeenCalledWith(registerData);

    const state = store.getState().auth;

    expect(state.isLoading).toBe(false);
    expect(state.user).toEqual(mockUser);
    expect(state.accessToken).toBe('register-access-token');
    expect(state.isAuthenticated).toBe(true);
    expect(state.error).toBeNull();
  });

  it('handles register rejection with an error message', async () => {
    vi.mocked(authService.register).mockRejectedValue(new Error('Email already exists'));

    const store = createStore();

    const result = await store.dispatch(registerUser(registerData));

    expect(result.type).toBe('auth/register/rejected');

    const state = store.getState().auth;

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Email already exists');
    expect(state.isAuthenticated).toBe(false);
  });

  it('handles register rejection with a fallback message for non-Error values', async () => {
    vi.mocked(authService.register).mockRejectedValue('registration failed');

    const store = createStore();

    const result = await store.dispatch(registerUser(registerData));

    expect(result.type).toBe('auth/register/rejected');

    const state = store.getState().auth;

    expect(state.isLoading).toBe(false);
    expect(state.error).toBe('Registration failed');
  });

  it('handles logout and resets the state', async () => {
    vi.mocked(authService.logout).mockResolvedValue(undefined);

    const store = createStore();

    store.dispatch(
      loginUser.fulfilled(
        {
          user: mockUser,
          accessToken: 'logout-test-token',
        },
        'logout-setup',
        credentials
      )
    );

    expect(store.getState().auth.isAuthenticated).toBe(true);

    const result = await store.dispatch(logoutUser());

    expect(result.type).toBe('auth/logout/fulfilled');
    expect(authService.logout).toHaveBeenCalledTimes(1);

    const state = store.getState().auth;

    expect(state).toEqual({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,
    });
  });
});

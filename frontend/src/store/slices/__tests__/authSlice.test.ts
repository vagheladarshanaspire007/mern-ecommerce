import { beforeEach, describe, expect, it, vi } from 'vitest';

const authServiceMocks = vi.hoisted(() => ({
  refresh: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
}));

vi.mock('@/services/auth.service', () => ({
  authService: authServiceMocks,
}));

import authReducer, {
  clearError,
  initializeAuth,
  loginUser,
  logoutUser,
  registerUser,
  setAccessToken,
  updateCurrentUser,
} from '@/store/slices/authSlice';

describe('authSlice', () => {
  const mockUser = {
    id: 'user-1',
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
    role: 'user' as const,
    emailVerified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,
    });
  });

  it('setAccessToken updates access token', () => {
    const nextState = authReducer(undefined, setAccessToken('token-123'));

    expect(nextState.accessToken).toBe('token-123');
  });

  it('clearError removes any stored error', () => {
    const state = {
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: 'bad credentials',
    };

    expect(authReducer(state, clearError()).error).toBeNull();
  });

  it('updateCurrentUser updates names when a user exists', () => {
    const state = {
      user: mockUser,
      accessToken: 'token-123',
      isAuthenticated: true,
      isLoading: false,
      isInitialized: true,
      error: null,
    };

    const nextState = authReducer(
      state,
      updateCurrentUser({ firstName: 'Janet', lastName: 'Smith' })
    );

    expect(nextState.user?.firstName).toBe('Janet');
    expect(nextState.user?.lastName).toBe('Smith');
  });

  it('updateCurrentUser is ignored when there is no current user', () => {
    const nextState = authReducer(
      undefined,
      updateCurrentUser({ firstName: 'Janet', lastName: 'Smith' })
    );

    expect(nextState.user).toBeNull();
  });

  it('initializeAuth fulfilled marks the session as authenticated', () => {
    const action = {
      type: initializeAuth.fulfilled.type,
      payload: { user: mockUser, accessToken: 'token-123' },
    };

    const nextState = authReducer(undefined, action);

    expect(nextState).toMatchObject({
      user: mockUser,
      accessToken: 'token-123',
      isAuthenticated: true,
      isInitialized: true,
    });
  });

  it('initializeAuth rejected marks the app as initialized without a session', () => {
    const nextState = authReducer(undefined, {
      type: initializeAuth.rejected.type,
    });

    expect(nextState).toMatchObject({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isInitialized: true,
    });
  });

  it('loginUser pending toggles loading and clears previous errors', () => {
    const state = {
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: 'old error',
    };

    const nextState = authReducer(state, {
      type: loginUser.pending.type,
    });

    expect(nextState.isLoading).toBe(true);
    expect(nextState.error).toBeNull();
  });

  it('loginUser fulfilled stores the authenticated user and token', () => {
    const nextState = authReducer(undefined, {
      type: loginUser.fulfilled.type,
      payload: { user: mockUser, accessToken: 'token-123' },
    });

    expect(nextState).toMatchObject({
      user: mockUser,
      accessToken: 'token-123',
      isAuthenticated: true,
      isLoading: false,
    });
  });

  it('loginUser rejected stores the error message', () => {
    const state = {
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,
      isInitialized: false,
      error: null,
    };

    const nextState = authReducer(state, {
      type: loginUser.rejected.type,
      payload: 'Invalid credentials',
    });

    expect(nextState.isLoading).toBe(false);
    expect(nextState.error).toBe('Invalid credentials');
  });

  it('registerUser pending toggles loading and clears previous errors', () => {
    const state = {
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: 'old error',
    };

    const nextState = authReducer(state, {
      type: registerUser.pending.type,
    });

    expect(nextState.isLoading).toBe(true);
    expect(nextState.error).toBeNull();
  });

  it('registerUser fulfilled keeps the user logged out in this flow', () => {
    const state = {
      user: mockUser,
      accessToken: 'token-123',
      isAuthenticated: true,
      isLoading: true,
      isInitialized: true,
      error: null,
    };

    const nextState = authReducer(state, {
      type: registerUser.fulfilled.type,
    });

    expect(nextState).toMatchObject({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  });

  it('registerUser rejected stores the error message', () => {
    const state = {
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,
      isInitialized: false,
      error: null,
    };

    const nextState = authReducer(state, {
      type: registerUser.rejected.type,
      payload: 'Registration failed',
    });

    expect(nextState.isLoading).toBe(false);
    expect(nextState.error).toBe('Registration failed');
  });

  it('logoutUser fulfilled clears all auth state and marks initialization complete', () => {
    const state = {
      user: mockUser,
      accessToken: 'token-123',
      isAuthenticated: true,
      isLoading: true,
      isInitialized: false,
      error: 'old error',
    };

    const nextState = authReducer(state, {
      type: logoutUser.fulfilled.type,
    });

    expect(nextState).toMatchObject({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: true,
      error: null,
    });
  });
});

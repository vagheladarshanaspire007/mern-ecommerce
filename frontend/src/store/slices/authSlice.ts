/**
 * ============================================================
 * Auth Slice — src/store/slices/authSlice.ts
 * ============================================================
 * Manages:
 *   - Current user identity (id, email, role)
 *   - Authentication state (isAuthenticated, isLoading)
 *   - Access token (in memory — NOT localStorage for security)
 *
 * WHY store access token in memory (Redux), not localStorage:
 *   localStorage is accessible by ANY JavaScript on the page.
 *   An XSS attack can read it. Storing in Redux (memory) means
 *   it disappears on page refresh — acceptable tradeoff because
 *   the refresh token in httpOnly cookie silently re-authenticates.
 *
 * Token refresh flow:
 *   1. Page loads → call /auth/refresh → get new access token → store in Redux
 *   2. Access token expires → axios interceptor calls /auth/refresh → retry
 *   3. Refresh token expires → redirect to login
 * ============================================================
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '@/services/auth.service';
import type { User, LoginCredentials, RegisterData } from '@/types/auth.types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean; // WHY: Track if we've checked for existing session
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
};

// ─── Async Thunks ────────────────────────────────────────────

/**
 * Silent refresh on app load — checks if user has a valid session
 * via the httpOnly refresh token cookie.
 * WHY: Persists login state across page refreshes without localStorage.
 */
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      const { user, accessToken } = await authService.refresh();
      return { user, accessToken };
    } catch {
      return rejectWithValue(null); // Not an error — just not logged in
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      return await authService.login(credentials);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Login failed';
      return rejectWithValue(message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (data: RegisterData, { rejectWithValue }) => {
    try {
      return await authService.register(data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      return rejectWithValue(message);
    }
  }
);

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await authService.logout(); // Clears httpOnly cookie on server
});

// ─── Slice ───────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Called by axios interceptor when token is refreshed
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // ── Initialize ──────────────────────────────────────────
    builder
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
        state.isInitialized = true;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isInitialized = true; // Mark initialized even if no session
      })

      // ── Login ───────────────────────────────────────────
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // ── Register ─────────────────────────────────────────
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.isLoading = false;

        // Registration does not authenticate the user.
        // User must login separately after registration.
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })

      // ── Logout ───────────────────────────────────────────
      .addCase(logoutUser.fulfilled, () => initialState);
  },
});

export const { setAccessToken, clearError } = authSlice.actions;
export default authSlice.reducer;

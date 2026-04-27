/**
 * ============================================================
 * Axios API Client — src/services/api.ts
 * ============================================================
 * WHY a shared axios instance instead of bare fetch():
 *   - Automatic base URL prefix
 *   - Request/response interceptors (auth headers, error handling)
 *   - Token refresh on 401 — transparent to calling code
 *   - Consistent timeout + error format
 *
 * Token Refresh Interceptor Flow:
 *   Request → 401 Unauthorized
 *   → Call /auth/refresh (with httpOnly cookie)
 *   → Get new access token → update Redux store
 *   → Retry original request with new token
 *   → If refresh also fails → logout + redirect to /login
 *
 * WHY isRefreshing flag + queue:
 *   Without it, 5 simultaneous 401s trigger 5 refresh calls.
 *   The flag ensures only 1 refresh happens; others wait in queue.
 * ============================================================
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { store } from '@/store';
import { setAccessToken, logoutUser } from '@/store/slices/authSlice';
import { InsufficientStockDetail } from '@/types/checkout.types';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';
const REQUEST_TIMEOUT = 15_000; // 15 seconds

// Create the shared axios instance
export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: REQUEST_TIMEOUT,
  withCredentials: true, // WHY: Sends httpOnly cookies (refresh token) cross-origin
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request Interceptor ─────────────────────────────────────
// Attach access token to every request from Redux store
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = store.getState().auth;
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    // Attach correlation ID for distributed tracing
    config.headers['X-Correlation-ID'] = crypto.randomUUID();

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor — Token Refresh ────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response, // Pass through successful responses

  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only intercept 401s that haven't already been retried
    // and are not from the refresh endpoint itself (prevent infinite loop)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        // Another refresh is in progress — queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh endpoint — httpOnly cookie is sent automatically
        const response = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = response.data.data.accessToken as string;
        store.dispatch(setAccessToken(newToken));
        processQueue(null, newToken);

        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed — session is truly expired
        processQueue(refreshError, null);
        void store.dispatch(logoutUser());
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For non-401 errors, normalize and re-throw
    return Promise.reject(normalizeError(error));
  }
);

/**
 * Normalize API errors into a consistent shape.
 * WHY: Keeps error handling in components simple — always the same structure.
 */
function normalizeError(error: AxiosError): Error {
  const data = error.response?.data as
    | {
        error?: {
          message?: string;
          code?: string;
          details?: InsufficientStockDetail[];
        };
      }
    | undefined;

  const message = data?.error?.message || error.message || 'An unexpected error occurred';

  const normalizedError = new Error(message);
  (normalizedError as Error & { code?: string; status?: number; details?: unknown[] }).code =
    data?.error?.code;
  (normalizedError as Error & { status?: number }).status = error.response?.status;
  (normalizedError as Error & { details?: unknown[] }).details = data?.error?.details;
  return normalizedError;
}

export default api;

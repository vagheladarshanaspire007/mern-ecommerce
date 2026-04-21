/**
 * Auth Service — src/services/auth.service.ts
 * Wraps all auth-related API calls.
 * WHY service layer: Controllers (components) should not know API URLs.
 * Services are the single source of truth for API interactions.
 */

import api from './api';
import type {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
} from '@/types/auth.types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<{ data: AuthResponse }>('/auth/login', credentials);
    return data.data;
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const { data } = await api.post<{ data: AuthResponse }>('/auth/register', userData);
    return data.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  refresh: async (): Promise<AuthResponse> => {
    const { data } = await api.post<{ data: AuthResponse }>('/auth/refresh');
    return data.data;
  },

  getMe: async (): Promise<User> => {
    const { data } = await api.get<{ data: User }>('/auth/me');
    return data.data;
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await api.post('/auth/reset-password', { token, password });
  },
};

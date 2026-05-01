/**
 * Auth Service — src/services/auth.service.ts
 * Wraps all auth-related API calls.
 * WHY service layer: Controllers (components) should not know API URLs.
 * Services are the single source of truth for API interactions.
 */

import api from './api';
import type { User, LoginCredentials, RegisterData, AuthResponse } from '@/types/auth.types';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse & { success: boolean; message?: string }>(
      '/auth/login',
      credentials
    );
    return { user: data.user, accessToken: data.accessToken };
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse & { success: boolean; message?: string }>(
      '/auth/register',
      userData
    );
    return { user: data.user, accessToken: data.accessToken };
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  refresh: async (): Promise<{ accessToken: string }> => {
    const { data } = await api.post<{ success: boolean; message?: string; accessToken: string }>(
      '/auth/refresh'
    );
    return { accessToken: data.accessToken };
  },

  getMe: async (): Promise<User> => {
    const { data } = await api.get<{ success: boolean; message?: string; user: User }>('/auth/me');
    return data.user;
  },

  forgotPassword: async (email: string): Promise<void> => {
    await api.post('/auth/forgot-password', { email });
  },

  resetPassword: async (token: string, password: string): Promise<void> => {
    await api.post('/auth/reset-password', { token, password });
  },
};

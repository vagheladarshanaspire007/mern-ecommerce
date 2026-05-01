import { http, HttpResponse } from 'msw';
import userEvent from '@testing-library/user-event';
import { fireEvent } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import LoginPage from '@/pages/auth/LoginPage';
import { server } from '@/mocks/server';
import { render, screen } from '@/test/utils';

const { toastSuccess, toastError, mockNavigate } = vi.hoisted(() => ({
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  mockNavigate: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: toastSuccess,
    error: toastError,
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginPage', () => {
  beforeEach(() => {
    toastSuccess.mockReset();
    toastError.mockReset();
    mockNavigate.mockReset();
  });

  it('renders login form fields', () => {
    render(<LoginPage />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('submitting empty form shows inline validation errors', async () => {
    render(<LoginPage />);
    const form = screen.getByRole('button', { name: /sign in/i }).closest('form');

    if (!form) throw new Error('Form element not found');
    fireEvent.submit(form);

    expect(await screen.findByText(/please enter a valid email address/i)).toBeInTheDocument();
    expect(
      await screen.findByText(/password must be at least 8 characters long\./i)
    ).toBeInTheDocument();
  });

  it('shows error toast on 401 response', async () => {
    const user = userEvent.setup();
    server.use(
      http.post('*/api/v1/auth/login', async () =>
        HttpResponse.json(
          {
            error: {
              message: 'Invalid credentials',
            },
          },
          { status: 401 }
        )
      )
    );

    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'user@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'Password1');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(toastError).toHaveBeenCalledWith('Invalid credentials');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('successful login redirects to dashboard', async () => {
    const user = userEvent.setup();
    server.use(
      http.post('*/api/v1/auth/login', async () =>
        HttpResponse.json({
          success: true,
          data: {
            user: {
              id: 'u-1',
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
              role: 'user',
              emailVerified: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            accessToken: 'token-123',
          },
        })
      )
    );

    render(<LoginPage />);

    await user.type(screen.getByLabelText(/email/i), 'john@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'Password1');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(toastSuccess).toHaveBeenCalledWith('Welcome back!');
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
  });
});

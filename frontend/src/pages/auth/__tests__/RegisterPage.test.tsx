import { http, HttpResponse } from 'msw';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createHotToastMock, createRouterDomMock, resetAuthPageMocks } from './authPageMocks';

import RegisterPage from '@/pages/auth/RegisterPage';
import { server } from '@/mocks/server';
import { render, screen } from '@/test/utils';

const mocks = vi.hoisted(() => ({
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  mockNavigate: vi.fn(),
}));
const { toastSuccess, mockNavigate } = mocks;

vi.mock('react-hot-toast', () => createHotToastMock(mocks));
vi.mock('react-router-dom', async () => createRouterDomMock(mocks));

describe('RegisterPage', () => {
  beforeEach(() => {
    resetAuthPageMocks(mocks);
  });

  it('shows validation error when passwords do not match', async () => {
    const user = userEvent.setup();
    render(<RegisterPage />);

    await user.type(screen.getByLabelText(/name/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/email/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'Password1');
    await user.type(screen.getByLabelText(/confirm password/i), 'Password2');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText(/passwords do not match\./i)).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('successful registration redirects to login', async () => {
    const user = userEvent.setup();
    server.use(
      http.post('*/api/v1/auth/register', async () =>
        HttpResponse.json({
          success: true,
          data: {
            user: {
              id: 'u-2',
              firstName: 'Jane',
              lastName: 'Doe',
              email: 'jane@example.com',
              role: 'user',
              emailVerified: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            accessToken: 'token-456',
          },
        })
      )
    );

    render(<RegisterPage />);

    await user.type(screen.getByLabelText(/name/i), 'Jane Doe');
    await user.type(screen.getByLabelText(/email/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'Password1');
    await user.type(screen.getByLabelText(/confirm password/i), 'Password1');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(toastSuccess).toHaveBeenCalledWith('Account created. Please sign in.');
    expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
  });
});

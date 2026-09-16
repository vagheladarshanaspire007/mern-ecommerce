import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';

import RegisterPage from '../RegisterPage';
import authReducer from '@/store/slices/authSlice';
import cartReducer from '@/store/slices/cartSlice';
import uiReducer from '@/store/slices/uiSlice';

const createStore = () =>
  configureStore({
    reducer: {
      auth: authReducer,
      cart: cartReducer,
      ui: uiReducer,
    },
  });

const renderRegisterPage = () => {
  const store = createStore();

  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={['/register']}>
          <Routes>
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      </Provider>
    ),
  };
};

describe('RegisterPage', () => {
  it('shows an error when passwords do not match', async () => {
    const user = userEvent.setup();

    renderRegisterPage();

    await user.type(screen.getByLabelText(/first name/i), 'Bhoomi');
    await user.type(screen.getByLabelText(/last name/i), 'Test');
    await user.type(screen.getByLabelText(/email/i), 'newuser@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'Password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'DifferentPassword123');

    await user.click(screen.getByRole('button', { name: /^register$/i }));

    expect(await screen.findByText('Passwords do not match')).toBeInTheDocument();
  });

  it('redirects to login after successful registration', async () => {
    const user = userEvent.setup();

    renderRegisterPage();

    await user.type(screen.getByLabelText(/first name/i), 'Bhoomi');
    await user.type(screen.getByLabelText(/last name/i), 'Test');
    await user.type(screen.getByLabelText(/email/i), 'newuser@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'Password123');
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123');

    await user.click(screen.getByRole('button', { name: /^register$/i }));

    expect(
      await screen.findByText('Registration successful! Please sign in to continue.')
    ).toBeInTheDocument();

    await waitFor(
      () => {
        expect(screen.getByText('Login Page')).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });
});

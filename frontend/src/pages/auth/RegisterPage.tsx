import { useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';

import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import { z } from 'zod';

import { useAppDispatch } from '@/store';

import { registerUser } from '@/store/slices/authSlice';

const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required'),
    lastName: z.string().trim().min(1, 'Last name is required'),
    email: z.string().trim().email('Please enter a valid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const RegisterPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setSuccessMessage('');

    const result = await dispatch(
      registerUser({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim(),
        password: data.password,
        confirmPassword: data.confirmPassword,
      })
    );

    if (registerUser.fulfilled.match(result)) {
      setSuccessMessage('Registration successful! Please sign in to continue.');

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 800);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center justify-center">
        <div className="w-full rounded-xl bg-white p-8 shadow-lg">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>

            <p className="mt-2 text-sm text-gray-600">Register a new account to get started.</p>
          </div>

          {errors.root?.message && (
            <div
              role="alert"
              className="mb-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {errors.root.message}
            </div>
          )}

          {successMessage && (
            <output
              aria-live="polite"
              className="mb-5 block rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700"
            >
              {successMessage}
            </output>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-gray-700">
                  First Name
                </label>

                <input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  disabled={isSubmitting}
                  placeholder="Bhoomi"
                  aria-invalid={errors.firstName ? 'true' : 'false'}
                  aria-describedby={errors.firstName ? 'firstName-error' : undefined}
                  {...register('firstName')}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-gray-100"
                />

                {errors.firstName && (
                  <p id="firstName-error" className="mt-1 text-sm text-red-600">
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-gray-700">
                  Last Name
                </label>

                <input
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  disabled={isSubmitting}
                  placeholder="Test"
                  aria-invalid={errors.lastName ? 'true' : 'false'}
                  aria-describedby={errors.lastName ? 'lastName-error' : undefined}
                  {...register('lastName')}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-gray-100"
                />

                {errors.lastName && (
                  <p id="lastName-error" className="mt-1 text-sm text-red-600">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>

              <input
                id="email"
                type="email"
                autoComplete="email"
                disabled={isSubmitting}
                placeholder="bhoomi@example.com"
                aria-invalid={errors.email ? 'true' : 'false'}
                aria-describedby={errors.email ? 'email-error' : undefined}
                {...register('email')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-gray-100"
              />

              {errors.email && (
                <p id="email-error" className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="mt-4">
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">
                Password
              </label>

              <input
                id="password"
                type="password"
                autoComplete="new-password"
                disabled={isSubmitting}
                placeholder="Minimum 8 characters"
                aria-invalid={errors.password ? 'true' : 'false'}
                aria-describedby={errors.password ? 'password-error' : undefined}
                {...register('password')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-gray-100"
              />

              {errors.password && (
                <p id="password-error" className="mt-1 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="mt-4">
              <label
                htmlFor="confirmPassword"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>

              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                disabled={isSubmitting}
                placeholder="Re-enter your password"
                aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
                {...register('confirmPassword')}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:bg-gray-100"
              />

              {errors.confirmPassword && (
                <p id="confirmPassword-error" className="mt-1 text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 w-full rounded-md bg-blue-600 px-4 py-2.5 font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Creating Account...' : 'Register'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

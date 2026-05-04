import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { z } from 'zod';

import { useAppDispatch, useAppSelector } from '@/store';
import { registerUser } from '@/store/slices/authSlice';

const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Please enter your full name.').max(80, 'Name is too long.'),
    email: z.string().email('Please enter a valid email address.'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters.')
      .regex(/[A-Z]/, 'Password must include at least one uppercase letter.')
      .regex(/[a-z]/, 'Password must include at least one lowercase letter.')
      .regex(/\d/, 'Password must include at least one number.'),
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  return fallback;
};

const splitName = (name: string) => {
  const parts = name.trim().split(/\s+/);
  const firstName = parts[0];
  const lastName = parts.slice(1).join(' ') || 'User';
  return { firstName, lastName };
};

export default function RegisterPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading } = useAppSelector((state) => state.auth);
  useEffect(() => {
    document.title = 'Register | MERN E-Commerce';
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const { firstName, lastName } = splitName(values.name);
      await dispatch(
        registerUser({
          firstName,
          lastName,
          email: values.email,
          password: values.password,
          confirmPassword: values.confirmPassword,
        })
      ).unwrap();

      toast.success('Account created. Please sign in.');
      navigate('/login', { replace: true });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Registration failed. Please try again.'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-3xl border border-gray-700 bg-gray-800 p-8 shadow-lg">
          <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">
            New account
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">Create account</h1>
          <p className="mt-2 text-sm text-gray-300">Get started in under a minute.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-300">
                Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                className="w-full rounded-2xl border border-gray-600 bg-gray-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                {...register('name')}
              />
              {errors.name ? (
                <p className="mt-1 text-sm text-rose-600">{errors.name.message}</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="w-full rounded-2xl border border-gray-600 bg-gray-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                {...register('email')}
              />
              {errors.email ? (
                <p className="mt-1 text-sm text-rose-600">{errors.email.message}</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                className="w-full rounded-2xl border border-gray-600 bg-gray-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                {...register('password')}
              />
              {errors.password ? (
                <p className="mt-1 text-sm text-rose-600">{errors.password.message}</p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1 block text-sm font-medium text-gray-300"
              >
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                className="w-full rounded-2xl border border-gray-600 bg-gray-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword ? (
                <p className="mt-1 text-sm text-rose-600">{errors.confirmPassword.message}</p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={isLoading || !isValid}
              className="w-full rounded-full bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-5 text-sm text-gray-300">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-indigo-300 hover:text-indigo-200">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

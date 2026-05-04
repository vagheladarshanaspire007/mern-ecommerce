import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { z } from 'zod';

import { useAppDispatch, useAppSelector } from '@/store';
import { loginUser } from '@/store/slices/authSlice';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long.')
    .regex(/[A-Z]/, 'Password must contain:\n1 uppercase letter')
    .regex(/[a-z]/, 'Password must contain:\n1 lowercase letter')
    .regex(/\d/, 'Password must contain:\n1 number'),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type LoginLocationState = { from?: { pathname: string; search?: string; hash?: string } };

const getErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  return fallback;
};

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isLoading } = useAppSelector((state) => state.auth);
  useEffect(() => {
    document.title = 'Login | MERN E-Commerce';
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await dispatch(loginUser(values)).unwrap();
      toast.success('Welcome back!');

      const state = location.state as LoginLocationState | null;
      const stateRedirect = state?.from
        ? `${state.from.pathname}${state.from.search ?? ''}${state.from.hash ?? ''}`
        : null;
      const queryRedirect = searchParams.get('redirect');
      navigate(stateRedirect || queryRedirect || '/dashboard', { replace: true });
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'Login failed. Please try again.'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-3xl border border-gray-700 bg-gray-800 p-8 shadow-lg">
          <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">
            Account access
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-gray-300">Sign in to continue shopping.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
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
                autoComplete="current-password"
                className="w-full rounded-2xl border border-gray-600 bg-gray-900 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                {...register('password')}
              />
              {errors.password ? (
                <p className="mt-1 text-sm text-rose-600">{errors.password.message}</p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={isLoading || !isValid}
              className="w-full rounded-full bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between text-sm">
            <Link to="/forgot-password" className="text-indigo-300 hover:text-indigo-200">
              Forgot password?
            </Link>
            <Link to="/register" className="text-indigo-300 hover:text-indigo-200">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

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
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-slate-50 via-white to-sky-50 px-4 py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute -right-24 top-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute left-1/2 top-[60%] h-72 w-72 -translate-x-1/2 rounded-full bg-slate-200/40 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-md">
        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-xl shadow-slate-200/40 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Welcome back</h1>
              <p className="mt-1 text-sm text-slate-600">Sign in to continue shopping.</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-linear-to-br from-sky-600 to-blue-700 shadow-sm ring-1 ring-black/10" />
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                className="w-full rounded-lg border border-slate-300 bg-white/70 px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-200"
                {...register('email')}
              />
              {errors.email ? (
                <p className="mt-1 text-sm text-rose-600">{errors.email.message}</p>
              ) : null}
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                className="w-full rounded-lg border border-slate-300 bg-white/70 px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-200"
                {...register('password')}
              />
              {errors.password ? (
                <p className="mt-1 text-sm text-rose-600">{errors.password.message}</p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={isLoading || !isValid}
              className="w-full rounded-lg bg-linear-to-r from-sky-600 to-blue-700 px-4 py-2 font-medium text-white shadow-sm ring-1 ring-black/10 transition hover:from-sky-500 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="mt-5 flex items-center justify-between text-sm">
            <Link to="/forgot-password" className="text-sky-700 hover:text-sky-800">
              Forgot password?
            </Link>
            <Link to="/register" className="text-sky-700 hover:text-sky-800">
              Create account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

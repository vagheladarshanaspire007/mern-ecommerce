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
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-white to-sky-50 px-4 py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-24 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-md">
        <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-xl shadow-slate-200/40 backdrop-blur">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Create account</h1>
          <p className="mt-1 text-sm text-slate-600">Get started in under a minute.</p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
                Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                className="w-full rounded-lg border border-slate-300 bg-white/70 px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-200"
                {...register('name')}
              />
              {errors.name ? (
                <p className="mt-1 text-sm text-rose-600">{errors.name.message}</p>
              ) : null}
            </div>

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
                autoComplete="new-password"
                className="w-full rounded-lg border border-slate-300 bg-white/70 px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-200"
                {...register('password')}
              />
              {errors.password ? (
                <p className="mt-1 text-sm text-rose-600">{errors.password.message}</p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                className="w-full rounded-lg border border-slate-300 bg-white/70 px-3 py-2 text-slate-900 shadow-sm outline-none transition focus:border-sky-500 focus:ring-4 focus:ring-sky-200"
                {...register('confirmPassword')}
              />
              {errors.confirmPassword ? (
                <p className="mt-1 text-sm text-rose-600">{errors.confirmPassword.message}</p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={isLoading || !isValid}
              className="w-full rounded-lg bg-gradient-to-r from-sky-600 to-blue-700 px-4 py-2 font-medium text-white shadow-sm ring-1 ring-black/10 transition hover:from-sky-500 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="mt-5 text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-sky-700 hover:text-sky-800">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

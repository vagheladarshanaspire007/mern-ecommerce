import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { authService } from '@/services/auth.service';

const resetPasswordSchema = z
  .object({
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

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  useEffect(() => {
    document.title = 'Reset Password | MERN E-Commerce';
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: ResetPasswordValues) => {
    if (!token) {
      toast.error('Reset token is missing.');
      return;
    }

    try {
      await authService.resetPassword(token, values.password);
      toast.success('Password reset successfully. Please sign in.');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not reset password.');
    }
  };

  if (!token) {
    return (
      <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-slate-50 via-white to-sky-50 px-4 py-12">
        <div className="relative mx-auto w-full max-w-md rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-xl shadow-slate-200/40 backdrop-blur">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Invalid reset link
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            This password reset link is missing a token or is malformed.
          </p>
          <p className="mt-5 text-sm text-slate-600">
            <Link to="/forgot-password" className="font-medium text-sky-700 hover:text-sky-800">
              Request a new reset link
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-slate-50 via-white to-sky-50 px-4 py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute -right-24 top-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-md">
        <div className="w-full rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-xl shadow-slate-200/40 backdrop-blur">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Create a new password
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Enter your new password to complete the reset process.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
                New password
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
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                Confirm new password
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
              disabled={isSubmitting || !isValid}
              className="w-full rounded-lg bg-linear-to-r from-sky-600 to-blue-700 px-4 py-2 font-medium text-white shadow-sm ring-1 ring-black/10 transition hover:from-sky-500 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Resetting...' : 'Reset password'}
            </button>
          </form>

          <p className="mt-5 text-sm text-slate-600">
            <Link to="/login" className="font-medium text-sky-700 hover:text-sky-800">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

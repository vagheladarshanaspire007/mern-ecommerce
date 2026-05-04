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
      <div className="min-h-screen bg-gray-900 px-4 py-12">
        <div className="mx-auto w-full max-w-md rounded-3xl border border-gray-700 bg-gray-800 p-8 shadow-lg">
          <h1 className="text-2xl font-semibold tracking-tight text-white">Invalid reset link</h1>
          <p className="mt-2 text-sm text-gray-300">
            This password reset link is missing a token or is malformed.
          </p>
          <p className="mt-5 text-sm text-gray-300">
            <Link to="/forgot-password" className="font-medium text-indigo-300 hover:text-indigo-200">
              Request a new reset link
            </Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="w-full rounded-3xl border border-gray-700 bg-gray-800 p-8 shadow-lg">
          <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">
            Account recovery
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">
            Create a new password
          </h1>
          <p className="mt-2 text-sm text-gray-300">
            Enter your new password to complete the reset process.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-300">
                New password
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
                Confirm new password
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
              disabled={isSubmitting || !isValid}
              className="w-full rounded-full bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Resetting...' : 'Reset password'}
            </button>
          </form>

          <p className="mt-5 text-sm text-gray-300">
            <Link to="/login" className="font-medium text-indigo-300 hover:text-indigo-200">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

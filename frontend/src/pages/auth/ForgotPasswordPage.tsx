import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { authService } from '@/services/auth.service';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  useEffect(() => {
    document.title = 'Forgot Password | MERN E-Commerce';
  }, []);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: 'onChange',
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    try {
      await authService.forgotPassword(values.email);
      toast.success('If the email exists, a reset link has been sent.');
      reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not send reset link.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="w-full rounded-3xl border border-gray-700 bg-gray-800 p-8 shadow-lg">
          <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">
            Password help
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-white">Forgot password</h1>
          <p className="mt-2 text-sm text-gray-300">
            Enter your email and we will send reset instructions.
          </p>

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

            <button
              type="submit"
              disabled={isSubmitting || !isValid}
              className="w-full rounded-full bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Sending...' : 'Send reset link'}
            </button>
          </form>

          <p className="mt-5 text-sm text-gray-300">
            Remembered your password?{' '}
            <Link to="/login" className="font-medium text-indigo-300 hover:text-indigo-200">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

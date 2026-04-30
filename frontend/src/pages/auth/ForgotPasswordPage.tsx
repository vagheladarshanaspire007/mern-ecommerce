import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { z } from 'zod';

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

  const onSubmit = async (_values: ForgotPasswordValues) => {
    await new Promise((resolve) => setTimeout(resolve, 450));
    toast.success('If the email exists, a reset link has been sent.');
    reset();
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-br from-slate-50 via-white to-sky-50 px-4 py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute -right-24 top-24 h-72 w-72 rounded-full bg-blue-200/40 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-md">
        <div className="w-full rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-xl shadow-slate-200/40 backdrop-blur">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Forgot password</h1>
          <p className="mt-1 text-sm text-slate-600">
            Enter your email and we will send reset instructions.
          </p>

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

            <button
              type="submit"
              disabled={isSubmitting || !isValid}
              className="w-full rounded-lg bg-linear-to-r from-sky-600 to-blue-700 px-4 py-2 font-medium text-white shadow-sm ring-1 ring-black/10 transition hover:from-sky-500 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? 'Sending...' : 'Send reset link'}
            </button>
          </form>

          <p className="mt-5 text-sm text-slate-600">
            Remembered your password?{' '}
            <Link to="/login" className="font-medium text-sky-700 hover:text-sky-800">
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

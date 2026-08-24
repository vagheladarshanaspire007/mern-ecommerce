import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/store';
import { loginUser } from '@/store/slices/authSlice';
import {
  useNavigate,
  Link,
  useSearchParams,
} from 'react-router-dom';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { isLoading } = useAppSelector((state) => state.auth);

  /**
   * ProtectedRoute sends the user to:
   *
   * /login?redirect=%2Fcheckout
   *
   * Read the redirect parameter and return the user
   * to the original protected page after successful login.
   */
  const redirect = searchParams.get('redirect');

  const from = redirect
    ? decodeURIComponent(redirect)
    : '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginForm) => {
    console.log('LOGIN SUBMIT:', data);

    const result = await dispatch(
      loginUser({
        email: data.email,
        password: data.password,
        rememberMe: data.rememberMe,
      }),
    );

    console.log('LOGIN RESULT:', result);

    if (loginUser.fulfilled.match(result)) {
      console.log('LOGIN SUCCESS');

      toast.success('Welcome back!');

      navigate(from, { replace: true });

      return;
    }

    const errorMessage =
      typeof result.payload === 'string'
        ? result.payload
        : 'Login failed';

    console.log('LOGIN FAILED:', errorMessage);

    toast.error(errorMessage);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white p-8 rounded-lg shadow-md"
          noValidate
        >
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Sign In
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Sign in to your account to continue.
            </p>
          </div>

          {/* Email */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              {...register('email')}
              aria-invalid={errors.email ? 'true' : 'false'}
              aria-describedby={
                errors.email ? 'email-error' : undefined
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {errors.email && (
              <p
                id="email-error"
                className="text-red-500 text-sm mt-1"
              >
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              {...register('password')}
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={
                errors.password ? 'password-error' : undefined
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {errors.password && (
              <p
                id="password-error"
                className="text-red-500 text-sm mt-1"
              >
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                {...register('rememberMe')}
                className="h-4 w-4"
              />

              <span>Remember me</span>
            </label>

            <Link
              to="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Forgot password?
            </Link>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-2.5 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>

          {/* Register */}
          <p className="text-center text-sm text-gray-600 mt-6">
            Do not have an account?{' '}
            <Link
              to="/register"
              className="text-blue-600 font-medium hover:text-blue-700"
            >
              Create an account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
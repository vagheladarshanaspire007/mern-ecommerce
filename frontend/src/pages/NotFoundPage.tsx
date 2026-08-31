import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <h1 className="text-6xl font-bold text-gray-900">404</h1>

      <h2 className="mt-4 text-2xl font-semibold text-gray-800">
        Page Not Found
      </h2>

      <p className="mt-2 text-gray-500">
        The page you`re looking for doesn`t exist.
      </p>

      <Link
        to="/products"
        className="mt-6 rounded-lg px-5 py-2.5 font-medium text-white hover:opacity-90"
      >
        Go Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
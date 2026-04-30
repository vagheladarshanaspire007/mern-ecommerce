import { useEffect } from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  useEffect(() => {
    document.title = 'Page Not Found | MERN E-Commerce';
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 px-4 py-10">
      <section className="w-full max-w-2xl rounded-3xl border border-gray-700 bg-gray-800 p-10 text-center shadow-lg">
        <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">Error 404</p>
        <h1 className="mt-4 text-4xl font-bold text-white sm:text-5xl">Page not found</h1>
        <p className="mt-4 text-base leading-7 text-gray-300">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved. Head back to
          the product catalog to keep shopping.
        </p>

        <div className="mt-8">
          <Link
            to="/products"
            className="inline-flex items-center justify-center rounded-2xl border border-indigo-500 bg-indigo-500 px-6 py-3 text-sm font-semibold text-white transition hover:border-indigo-400 hover:bg-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800"
          >
            Go Home
          </Link>
        </div>
      </section>
    </div>
  );
};

export default NotFoundPage;

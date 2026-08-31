import { Link } from 'react-router-dom';
import { useAppSelector } from '@/store';


const DashboardPage = () => {
  const user = useAppSelector((state) => state.auth.user);

  const firstName = user?.firstName ?? 'User';

  const summaryCards = [
    {
      title: 'Orders',
      value: '12',
    },
    {
      title: 'Total Spent',
      value: '₹24,500',
    },
    {
      title: 'Wishlist',
      value: '5',
    },
  ];

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {firstName}!
        </h1>
        <p className="mt-2 text-gray-500">
          Heres a quick overview of your account.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {summaryCards.map((card) => (
          <div
            key={card.title}
            className="rounded-lg border bg-white p-6 shadow-sm"
          >
            <p className="text-sm font-medium text-gray-500">{card.title}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Quick Links
        </h2>

        <div className="flex flex-wrap gap-4">
          <Link
            to="/products"
            className="rounded-lg border px-5 py-3 font-medium hover:bg-gray-50"
          >
            Products
          </Link>

          <Link
            to="/cart"
            className="rounded-lg border px-5 py-3 font-medium hover:bg-gray-50"
          >
            Cart
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
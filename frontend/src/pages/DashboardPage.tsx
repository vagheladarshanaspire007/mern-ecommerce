import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Receipt, ArrowRight } from 'lucide-react';
import { useAppSelector } from '@/store';

const summaryCards = [
  {
    label: 'Orders count',
    value: '12',
    description: 'Orders placed across your recent shopping activity.',
    icon: Receipt,
  },
  {
    label: 'Total spent',
    value: '₹1,248',
    description: 'Lifetime spend on purchases in this dashboard.',
    icon: ShoppingBag,
  },
  {
    label: 'Wishlist count',
    value: '7',
    description: 'Saved items you may want to revisit later.',
    icon: Heart,
  },
] as const;

const quickLinks = [
  {
    title: 'Browse products',
    description: 'Explore the catalog and discover new items.',
    to: '/products',
  },
  {
    title: 'Review your cart',
    description: 'Continue checkout with items in your cart.',
    to: '/cart',
  },
] as const;

const DashboardPage = () => {
  const user = useAppSelector((state) => state.auth.user);
  const firstName = user?.firstName?.trim() || 'there';
  useEffect(() => {
    document.title = 'Dashboard | MERN E-Commerce';
  }, []);

  return (
    <div className="mx-auto max-w-full space-y-8 px-4 py-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <section className="rounded-3xl border border-gray-700 bg-gray-800 p-8 shadow-lg">
        <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">
          Account overview
        </p>

        <h1 className="mt-3 text-3xl font-bold text-white sm:text-4xl">
          Welcome back, {firstName}
        </h1>

        <p className="mt-3 max-w-2xl text-gray-400">
          Here’s a quick snapshot of your activity and shortcuts to continue shopping.
        </p>
      </section>

      {/* Summary Cards */}
      <section className="grid gap-4 md:grid-cols-3">
        {summaryCards.map(({ label, value, description, icon: Icon }) => (
          <article
            key={label}
            className="rounded-2xl border border-gray-700 bg-gray-800 p-6 shadow-md transition hover:-translate-y-1 hover:border-indigo-500 hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-400">{label}</p>
                <p className="mt-2 text-3xl font-bold text-white">{value}</p>
              </div>

              <div className="rounded-full bg-indigo-500/10 p-3 text-indigo-400">
                <Icon className="h-5 w-5" />
              </div>
            </div>

            <p className="mt-4 text-sm text-gray-400">{description}</p>
          </article>
        ))}
      </section>

      {/* Quick Links */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-white">Quick links</h2>
          <p className="mt-1 text-sm text-gray-400">Jump into common actions quickly.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {quickLinks.map(({ title, description, to }) => (
            <Link
              key={to}
              to={to}
              className="group rounded-2xl border border-gray-700 bg-gray-800 p-6 shadow-md transition hover:border-indigo-500 hover:bg-gray-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm text-gray-400">{description}</p>
                </div>

                <ArrowRight className="mt-1 h-5 w-5 text-gray-400 transition group-hover:translate-x-1 group-hover:text-indigo-400" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;

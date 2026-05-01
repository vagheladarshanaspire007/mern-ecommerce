import { useEffect, useState } from 'react';
import { Boxes, ClipboardList, Users } from 'lucide-react';

const adminTabs = [
  {
    id: 'products',
    label: 'Products',
    description: 'Manage inventory, pricing, and featured catalog items.',
    icon: Boxes,
  },
  {
    id: 'orders',
    label: 'Orders',
    description: 'Track order flow, fulfillment, and recent activity.',
    icon: ClipboardList,
  },
  {
    id: 'users',
    label: 'Users',
    description: 'Review customer accounts, roles, and verification status.',
    icon: Users,
  },
] as const;

type AdminTabId = (typeof adminTabs)[number]['id'];

const skeletonConfig: Record<AdminTabId, { title: string; lines: number[] }> = {
  products: {
    title: 'Product management loading',
    lines: [90, 65, 80, 55],
  },
  orders: {
    title: 'Order queue loading',
    lines: [88, 72, 62, 84],
  },
  users: {
    title: 'User directory loading',
    lines: [78, 58, 82, 68],
  },
};

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState<AdminTabId>('products');
  const activeTabConfig = adminTabs.find((tab) => tab.id === activeTab) ?? adminTabs[0];
  const activeSkeleton = skeletonConfig[activeTab];
  useEffect(() => {
    document.title = 'Admin Dashboard | MERN E-Commerce';
  }, []);

  return (
    <div className="mx-auto min-h-screen max-w-full space-y-8 bg-gray-900 px-4 py-6">
      <section className="rounded-3xl border border-gray-700 bg-gray-800 p-8 shadow-lg">
        <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">
          Admin control center
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Admin dashboard
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-gray-300">
          Switch between products, orders, and users to manage the store from one dark-theme admin
          shell.
        </p>
      </section>

      <section className="rounded-3xl border border-gray-700 bg-gray-800 p-4 shadow-md">
        <div className="grid gap-3 md:grid-cols-3">
          {adminTabs.map(({ id, label, description, icon: Icon }) => {
            const isActive = id === activeTab;

            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`rounded-2xl border p-5 text-left transition focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isActive
                    ? 'border-indigo-500 bg-indigo-500/10 shadow-md'
                    : 'border-gray-700 bg-gray-900 hover:border-indigo-500/60 hover:bg-gray-700/70'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p
                      className={`text-lg font-semibold ${
                        isActive ? 'text-white' : 'text-gray-100'
                      }`}
                    >
                      {label}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-gray-400">{description}</p>
                  </div>
                  <div
                    className={`rounded-full p-3 ${
                      isActive ? 'bg-indigo-500/15 text-indigo-300' : 'bg-gray-800 text-indigo-400'
                    }`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-gray-700 bg-gray-800 p-6 shadow-md">
        <div className="flex flex-col gap-3 border-b border-gray-700 pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">{activeTabConfig.label}</h2>
            <p className="mt-2 text-sm leading-6 text-gray-400">{activeTabConfig.description}</p>
          </div>
          <span className="inline-flex rounded-full border border-indigo-500/40 bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-300">
            Content stubbed with skeleton placeholders
          </span>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-2xl border border-gray-700 bg-gray-900 p-5">
            <div className="animate-pulse">
              <div className="h-5 w-44 rounded-full bg-gray-700" />
              <div className="mt-6 space-y-4">
                {activeSkeleton.lines.map((width, index) => (
                  <div
                    key={`${activeTab}-main-${index}`}
                    className="rounded-2xl border border-gray-800 bg-gray-800/80 p-4"
                  >
                    <div className="h-4 rounded-full bg-gray-700" style={{ width: `${width}%` }} />
                    <div className="mt-3 h-3 rounded-full bg-gray-800" style={{ width: '92%' }} />
                    <div className="mt-2 h-3 rounded-full bg-gray-800" style={{ width: '70%' }} />
                  </div>
                ))}
              </div>
            </div>
          </article>

          <aside className="rounded-2xl border border-gray-700 bg-gray-900 p-5">
            <div className="animate-pulse">
              <div className="h-5 w-36 rounded-full bg-gray-700" />
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-gray-800 bg-gray-800/80 p-4">
                  <div className="h-4 w-28 rounded-full bg-gray-700" />
                  <div className="mt-4 h-10 rounded-2xl bg-gray-700" />
                </div>
                <div className="rounded-2xl border border-gray-800 bg-gray-800/80 p-4">
                  <div className="h-4 w-24 rounded-full bg-gray-700" />
                  <div className="mt-3 h-3 w-11/12 rounded-full bg-gray-800" />
                  <div className="mt-2 h-3 w-4/5 rounded-full bg-gray-800" />
                  <div className="mt-2 h-3 w-2/3 rounded-full bg-gray-800" />
                </div>
              </div>
            </div>
          </aside>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          Next step: replace each skeleton panel with real admin tables, metrics, and actions.
        </p>
      </section>
    </div>
  );
};

export default AdminDashboardPage;

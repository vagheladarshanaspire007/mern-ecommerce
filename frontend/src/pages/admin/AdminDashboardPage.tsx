import { useState } from 'react';

const tabs = ['Products', 'Orders', 'Users'] as const;

type AdminTab = (typeof tabs)[number];

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('Products');

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-gray-500">Manage products, orders, and users.</p>
      </div>

      <div className="border-b">
        <nav className="flex gap-6" aria-label="Admin navigation">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 px-1 py-3 text-sm font-medium ${
                activeTab === tab
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      <div className="rounded-lg border bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">{activeTab}</h2>

        <div className="mt-6 space-y-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-12 w-full animate-pulse rounded bg-gray-200" />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

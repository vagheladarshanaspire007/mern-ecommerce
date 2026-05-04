import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { DataTable, type Column } from '@/components/ui/DataTable';
import api from '@/services/api';
import type { Order } from '@/types/auth.types';

type OrdersResponse = {
  data: {
    items: Order[];
  };
};

const statusStyles: Record<Order['status'], string> = {
  cancelled: 'border-red-500/30 bg-red-500/10 text-red-300',
  delivered: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  pending: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
  processing: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
  shipped: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300',
};

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);

const columns: Column<Order>[] = [
  {
    key: 'id',
    label: 'Order ID',
    render: (order) => <span className="font-medium text-white">{order.id}</span>,
  },
  {
    key: 'date',
    label: 'Date',
    render: (order) => <span className="text-gray-300">{formatDate(order.createdAt)}</span>,
  },
  {
    key: 'status',
    label: 'Status',
    render: (order) => (
      <span
        className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusStyles[order.status]}`}
      >
        {order.status}
      </span>
    ),
  },
  {
    key: 'total',
    label: 'Total',
    className: 'text-right',
    render: (order) => (
      <span className="font-medium text-white">{formatCurrency(order.totalAmount)}</span>
    ),
  },
];

const OrderHistoryPage = () => {
  useEffect(() => {
    document.title = 'Order History | MERN E-Commerce';
  }, []);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['order-history'],
    queryFn: async () => {
      const response = await api.get<OrdersResponse>('/orders');
      return response.data.data.items;
    },
  });

  return (
    <div className="mx-auto min-h-screen max-w-full space-y-8 bg-gray-900 px-4 py-6">
      <section className="rounded-3xl border border-gray-700 bg-gray-800 p-8 shadow-lg">
        <p className="text-sm font-medium uppercase tracking-widest text-indigo-400">
          Purchase history
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Order history
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-gray-300">
          Review your previous orders with status and totals in one place.
        </p>
      </section>

      {isError ? (
        <section className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 shadow-md">
          <h2 className="text-lg font-semibold text-white">Could not load order history</h2>
          <p className="mt-2 text-sm text-red-200">
            {error instanceof Error ? error.message : 'Something went wrong while loading orders.'}
          </p>
        </section>
      ) : (
        <DataTable
          caption="Past orders"
          columns={columns}
          data={data ?? []}
          emptyMessage="No past orders found yet."
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default OrderHistoryPage;

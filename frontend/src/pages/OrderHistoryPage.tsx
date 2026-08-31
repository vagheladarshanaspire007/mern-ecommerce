import { DataTable } from '@/components/ui/DataTable';
import type { Order, OrderStatus } from '@/types/auth.types';

const mockOrders: Order[] = [
  {
    id: 'ORD-1001',
    userId: 'user-001',
    items: [],
    totalAmount: 1299,
    status: 'delivered',
    createdAt: '2026-08-20T10:30:00Z',
  },
  {
    id: 'ORD-1002',
    userId: 'user-001',
    items: [],
    totalAmount: 2499,
    status: 'shipped',
    createdAt: '2026-08-18T14:15:00Z',
  },
  {
    id: 'ORD-1003',
    userId: 'user-001',
    items: [],
    totalAmount: 799,
    status: 'processing',
    createdAt: '2026-08-15T09:45:00Z',
  },
  {
    id: 'ORD-1004',
    userId: 'user-001',
    items: [],
    totalAmount: 1899,
    status: 'cancelled',
    createdAt: '2026-08-10T16:20:00Z',
  },
];

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const statusClasses: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const columns = [
  {
    key: 'id',
    label: 'Order ID',
  },
  {
    key: 'createdAt',
    label: 'Date',
    render: (order: Order) =>
      new Date(order.createdAt).toLocaleDateString(),
  },
  {
    key: 'status',
    label: 'Status',
    render: (order: Order) => (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusClasses[order.status]}`}
      >
        {statusLabels[order.status]}
      </span>
    ),
  },
  {
    key: 'totalAmount',
    label: 'Total',
    render: (order: Order) => `₹${order.totalAmount.toLocaleString('en-IN')}`,
  },
];

export default function OrderHistoryPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">Order History</h1>
        <p className="mt-1 text-sm text-gray-500">
          View your past orders and their current status.
        </p>
      </div>
<DataTable
  columns={columns}
  data={mockOrders}
  getRowKey={(order) => order.id}
/>
    </div>
  );
}
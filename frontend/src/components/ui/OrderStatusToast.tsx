import type { OrderStatus } from '@/types/auth.types';

interface OrderStatusToastProps {
  orderId: string;
  status: OrderStatus;
}

const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: 'bg-gray-100 text-gray-700',
  processing: 'bg-blue-100 text-blue-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export function OrderStatusToast({ status }: Readonly<OrderStatusToastProps>) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-3xl border border-gray-700 bg-gray-800 px-5 py-4 shadow-md">
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-500" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">Order updated</p>
          <p className="mt-1 text-xs text-gray-400">Your order status changed.</p>
        </div>
      </div>
      <span
        className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${STATUS_STYLES[status]}`}
      >
        {status}
      </span>
    </div>
  );
}

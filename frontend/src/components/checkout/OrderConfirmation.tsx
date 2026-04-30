import { Link } from 'react-router-dom';

import type { CheckoutOrder } from '@/types/checkout.types';

interface OrderConfirmationProps {
  order: CheckoutOrder;
  estimatedDelivery: string;
}

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

export function OrderConfirmation({ order, estimatedDelivery }: Readonly<OrderConfirmationProps>) {
  return (
    <section className="rounded-3xl border border-gray-700 bg-gray-800 p-5 shadow-md sm:p-8">
      <div className="rounded-3xl border border-gray-700 bg-emerald-500/15 p-5 shadow-md sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">
          Order Confirmed
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
          Thanks for your purchase.
        </h2>
        <p className="mt-3 text-sm text-gray-300">
          Your order <span className="font-semibold text-white">#{order.id}</span> is now in the
          queue for dispatch.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-3xl border border-gray-700 bg-gray-900 p-5 shadow-md">
          <h3 className="text-lg font-semibold text-white">Delivery Details</h3>
          <div className="mt-4 space-y-2 text-sm text-gray-300">
            <p className="font-medium text-white">{order.shippingAddress.fullName}</p>
            <p>{order.shippingAddress.address}</p>
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
              {order.shippingAddress.pin}
            </p>
            <p>Phone: {order.shippingAddress.phone}</p>
            <p className="rounded-3xl bg-emerald-500/15 px-4 py-3 text-sm font-medium text-emerald-300">
              Estimated delivery: {estimatedDelivery}
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-700 bg-gray-900 p-5 shadow-md">
          <h3 className="text-lg font-semibold text-white">Order Snapshot</h3>
          <div className="mt-4 space-y-3">
            {order.items.map((item) => (
              <div
                key={item.productId}
                className="flex flex-col gap-2 text-sm sm:flex-row sm:items-start sm:justify-between sm:gap-4"
              >
                <div>
                  <p className="font-medium text-white">{item.productName}</p>
                  <p className="text-gray-400">Qty: {item.quantity}</p>
                </div>
                <p className="font-medium text-white sm:text-right">
                  {currencyFormatter.format(item.lineTotal)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 border-t border-gray-700 pt-4">
            <div className="flex items-center justify-between text-sm font-semibold text-white">
              <span>Total Paid</span>
              <span>{currencyFormatter.format(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Link
          to="/products"
          className="inline-flex w-full justify-center rounded-full bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-400 sm:w-auto"
        >
          Continue Shopping
        </Link>
      </div>
    </section>
  );
}

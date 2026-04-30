import type { CartItem } from '@/store/slices/cartSlice';
import type { InsufficientStockIssue, ShippingAddress } from '@/types/checkout.types';

interface OrderSummaryProps {
  cartItems: CartItem[];
  totalAmount: number;
  shippingAddress: ShippingAddress;
  isSubmitting: boolean;
  errorMessage: string | null;
  insufficientStockIssues: InsufficientStockIssue[];
  onBack: () => void;
  onPlaceOrder: () => void;
}

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

export function OrderSummary({
  cartItems,
  totalAmount,
  shippingAddress,
  isSubmitting,
  errorMessage,
  insufficientStockIssues,
  onBack,
  onPlaceOrder,
}: Readonly<OrderSummaryProps>) {
  const stockIssueMap = new Map(insufficientStockIssues.map((issue) => [issue.productId, issue]));

  return (
    <section className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-3xl border border-gray-700 bg-gray-800 p-5 shadow-md sm:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-white">Order Summary</h2>
            <p className="mt-2 text-sm text-gray-300">
              Review your cart and shipping details before placing the order.
            </p>
          </div>

          {errorMessage ? (
            <div className="mb-5 rounded-3xl border border-gray-700 bg-rose-500/15 px-4 py-3 text-sm text-rose-300">
              {errorMessage}
            </div>
          ) : null}

          {insufficientStockIssues.length > 0 ? (
            <div className="mb-5 rounded-3xl border border-gray-700 bg-amber-500/15 px-4 py-3">
              <h3 className="text-sm font-semibold text-amber-300">Insufficient stock</h3>
              <ul className="mt-2 space-y-1 text-sm text-amber-300">
                {insufficientStockIssues.map((issue) => (
                  <li key={issue.productId}>
                    {issue.productName ?? issue.productId}: {issue.message}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="space-y-4">
            {cartItems.map((item) => {
              const lineTotal = item.price * item.quantity;
              const stockIssue = stockIssueMap.get(item.productId);

              return (
                <article
                  key={item.productId}
                  className={`rounded-2xl border px-4 py-4 transition ${
                    stockIssue ? 'border-gray-700 bg-rose-500/15' : 'border-gray-700 bg-gray-900'
                  }`}
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-white">{item.name}</h3>
                      <p className="mt-1 text-sm text-gray-300">Qty: {item.quantity}</p>
                      <p className="mt-1 text-sm text-gray-400">
                        Unit Price: {currencyFormatter.format(item.price)}
                      </p>
                    </div>

                    <p className="text-sm font-semibold text-white sm:text-right">
                      {currencyFormatter.format(lineTotal)}
                    </p>
                  </div>

                  {stockIssue ? (
                    <p className="mt-3 text-sm font-medium text-rose-300">{stockIssue.message}</p>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-gray-700 bg-gray-800 p-5 shadow-md sm:p-6">
            <h2 className="text-lg font-semibold text-white">Shipping Review</h2>
            <div className="mt-4 space-y-2 text-sm text-gray-300">
              <p className="font-medium text-white">{shippingAddress.fullName}</p>
              <p>{shippingAddress.address}</p>
              <p>
                {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pin}
              </p>
              <p>Phone: {shippingAddress.phone}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-gray-700 bg-gray-800 p-5 text-white shadow-md sm:p-6">
            <div className="flex items-center justify-between text-sm text-gray-300">
              <span>Total</span>
              <span className="text-white">{currencyFormatter.format(totalAmount)}</span>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={onPlaceOrder}
                disabled={isSubmitting}
                className="w-full rounded-full bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? 'Placing Order...' : 'Place Order'}
              </button>

              <button
                type="button"
                onClick={onBack}
                disabled={isSubmitting}
                className="w-full rounded-full border border-gray-700 bg-gray-900 px-5 py-3 text-sm font-semibold text-gray-300 shadow-md transition hover:bg-gray-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                Back
              </button>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}

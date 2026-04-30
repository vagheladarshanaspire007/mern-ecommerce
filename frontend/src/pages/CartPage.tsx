import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store';
import { clearCart, selectCartItems, selectCartTotal } from '@/store/slices/cartSlice';
import CartItem from '@/components/ui/CartItem';

const TAX_RATE = 0.1;

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'INR',
});

function EmptyState() {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm">
      <h1 className="text-2xl font-bold text-slate-900">Your cart is empty</h1>
      <p className="mt-2 text-sm text-slate-600">Browse products and add items to continue.</p>
      <Link
        to="/products"
        className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
      >
        Continue Shopping
      </Link>
    </div>
  );
}

export default function CartPage() {
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartTotal);
  const dispatch = useAppDispatch();

  if (items.length === 0) {
    return (
      <section className="py-12">
        <EmptyState />
      </section>
    );
  }

  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  return (
    <section className="py-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your Cart</h1>
          <p className="mt-1 text-sm text-slate-600">Review your items before checkout.</p>
        </div>

        <button
          type="button"
          onClick={() => dispatch(clearCart())}
          className="rounded-xl border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50"
        >
          Clear Cart
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-4 lg:col-span-8">
          {items.map((item) => (
            <CartItem key={item.productId} item={item} variant="full" />
          ))}
        </div>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-4 lg:sticky lg:top-6 lg:h-fit">
          <h2 className="text-lg font-bold text-slate-900">Order Summary</h2>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between text-slate-700">
              <span>Subtotal</span>
              <span>{currencyFormatter.format(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-700">
              <span>Tax (10%)</span>
              <span>{currencyFormatter.format(tax)}</span>
            </div>
            <div className="border-t border-slate-200 pt-3">
              <div className="flex items-center justify-between text-base font-bold text-slate-900">
                <span>Total</span>
                <span>{currencyFormatter.format(total)}</span>
              </div>
            </div>
          </div>

          <Link
            to="/checkout"
            className="mt-5 inline-flex w-full justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Proceed to Checkout
          </Link>
        </aside>
      </div>
    </section>
  );
}

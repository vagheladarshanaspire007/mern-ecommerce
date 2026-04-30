import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '@/store';
import { selectCartItems, selectCartTotal } from '@/store/slices/cartSlice';
import CartItem from '@/components/ui/CartItem';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'INR',
});

function EmptyCartState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <h3 className="text-base font-semibold text-slate-900">Your cart is empty</h3>
      <p className="mt-1 text-sm text-slate-600">Add products to see them here.</p>
    </div>
  );
}

export default function CartDrawer({ isOpen, onClose }: Readonly<CartDrawerProps>) {
  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartTotal);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  const handleNavigate = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-900/45 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md transform flex-col bg-white shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Cart drawer"
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-bold text-slate-900">Your Cart</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Close
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {items.length === 0 ? (
            <EmptyCartState />
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <CartItem key={item.productId} item={item} variant="compact" />
              ))}
            </div>
          )}
        </div>

        <footer className="border-t border-slate-200 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Subtotal</span>
            <span className="text-lg font-bold text-slate-900">
              {currencyFormatter.format(subtotal)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleNavigate('/cart')}
              className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
            >
              View Cart
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('/checkout')}
              disabled={items.length === 0}
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              Checkout
            </button>
          </div>
        </footer>
      </aside>
    </>
  );
}

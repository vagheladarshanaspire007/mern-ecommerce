import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useLocalStorage } from '@/hooks';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  hydrateCart,
  removeFromCart,
  selectCartItems,
  selectCartTotal,
  toggleCart,
  type CartItem as CartItemType,
} from '@/store/slices/cartSlice';

import { CartItem } from '../ui/CartItem';
import { useCartActions } from '@/hooks/useCartActions';

const CART_STORAGE_KEY = 'cart-items';

export function CartDrawer() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartTotal);
  const isOpen = useAppSelector((state) => state.cart.isOpen);

  const [storedItems, setStoredItems] = useLocalStorage<CartItemType[]>(CART_STORAGE_KEY, []);

  const hasHydrated = useRef(false);

  // Restore cart from localStorage on first render.
  useEffect(() => {
    if (!hasHydrated.current) {
      dispatch(hydrateCart(storedItems));
      hasHydrated.current = true;
    }
  }, [dispatch, storedItems]);

  // Persist Redux cart changes to localStorage.
  useEffect(() => {
    if (hasHydrated.current) {
      setStoredItems(items);
    }
  }, [items, setStoredItems]);

  const { handleIncrease, handleDecrease } = useCartActions();

  const handleRemove = (productId: string) => {
    dispatch(removeFromCart(productId));
  };

  const handleViewCart = () => {
    dispatch(toggleCart());
    void navigate('/cart');
  };

  const handleCheckout = () => {
    dispatch(toggleCart());
    void navigate('/checkout');
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => dispatch(toggleCart())}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        aria-label="Shopping cart"
        aria-hidden={!isOpen}
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-md transform flex-col bg-white shadow-xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'pointer-events-none translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Cart</h2>

          <button
            type="button"
            onClick={() => dispatch(toggleCart())}
            aria-label="Close cart"
            className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5">
          {items.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-gray-500">Your cart is empty.</p>
            </div>
          ) : (
            items.map((item) => (
              <CartItem
                key={item.productId}
                item={item}
                onIncrease={() => handleIncrease(item.productId, item.quantity, item.stock)}
                onDecrease={() => handleDecrease(item.productId, item.quantity)}
                onRemove={() => handleRemove(item.productId)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-base font-medium text-gray-700">Subtotal</span>

              <span className="text-lg font-bold text-gray-900">₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="grid gap-2">
              <button
                type="button"
                onClick={handleViewCart}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                View Cart
              </button>

              <button
                type="button"
                onClick={handleCheckout}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

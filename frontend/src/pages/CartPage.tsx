import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  removeFromCart,
  selectCartItems,
  selectCartTotal,
  updateQuantity,
} from '@/store/slices/cartSlice';

import { EmptyState } from '@/components/ui/EmptyState';
import { CartItem } from '@/components/ui/CartItem';
import { ShoppingCart } from 'lucide-react';

export function CartPage() {
  const dispatch = useAppDispatch();

  const items = useAppSelector(selectCartItems);
  const subtotal = useAppSelector(selectCartTotal);

  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleIncrease = (productId: string, quantity: number, stock: number) => {
    if (quantity >= stock) {
      toast.error(`Only ${stock} item(s) available in stock.`);
      return;
    }

    dispatch(
      updateQuantity({
        productId,
        quantity: quantity + 1,
      })
    );
  };

  const handleDecrease = (productId: string, quantity: number) => {
    dispatch(
      updateQuantity({
        productId,
        quantity: quantity - 1,
      })
    );
  };

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingCart className="h-6 w-6" />}
        title="Your cart is empty"
        description="Add some products to your cart to continue shopping."
        action={
          <Link
            to="/products"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Continue Shopping
          </Link>
        }
      />
    );
  }
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Shopping Cart</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Cart Items */}
        <section className="rounded-lg bg-white p-5 shadow-sm">
          {items.map((item) => (
            <CartItem
              key={item.productId}
              item={item}
              onIncrease={() => handleIncrease(item.productId, item.quantity, item.stock)}
              onDecrease={() => handleDecrease(item.productId, item.quantity)}
              onRemove={() => dispatch(removeFromCart(item.productId))}
            />
          ))}
        </section>

        {/* Order Summary */}
        <aside className="h-fit rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">Order Summary</h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-medium text-gray-900">₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Tax (10%)</span>
              <span className="font-medium text-gray-900">₹{tax.toFixed(2)}</span>
            </div>

            <div className="border-t pt-3">
              <div className="flex justify-between">
                <span className="text-base font-semibold text-gray-900">Total</span>
                <span className="text-base font-bold text-gray-900">₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <Link
            to="/checkout"
            className="mt-6 block w-full rounded-lg bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Proceed to Checkout
          </Link>
        </aside>
      </div>
    </div>
  );
}

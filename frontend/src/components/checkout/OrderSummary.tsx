/**
 * ============================================================
 * Order Summary — src/components/checkout/OrderSummary.tsx
 * ============================================================
 * Step 2 of the checkout flow.
 *
 * Responsibilities:
 *   - Display cart items and quantities
 *   - Display subtotal, tax and total
 *   - Display shipping address for review
 *   - Show API / stock errors inline
 *   - Allow the user to go back to shipping
 *   - Trigger Place Order through the parent callback
 *
 * WHY the API call is handled by CheckoutPage:
 *   CheckoutPage owns the checkout flow state. Keeping the
 *   request there makes this component focused on displaying
 *   the order information and collecting user actions.
 * ============================================================
 */

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

import type { ShippingAddress } from './ShippingForm';

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  stock: number;
  imageUrl?: string;
}

export interface InsufficientStockItem {
  productId: string;
  productName: string;
  requested: number;
  available: number;
}

interface OrderSummaryProps {
  items: CartItem[];
  shippingAddress: ShippingAddress;
  isLoading: boolean;
  errorMessage: string | null;
  insufficientStockItems: InsufficientStockItem[];
  onBack: () => void;
  onPlaceOrder: () => void;
}

export function OrderSummary({
  items,
  shippingAddress,
  isLoading,
  errorMessage,
  insufficientStockItems,
  onBack,
  onPlaceOrder,
}: OrderSummaryProps) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>

        <p className="mt-1 text-sm text-gray-500">
          Review your items and shipping address before placing the order.
        </p>
      </div>

      {errorMessage && (
        <div
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <p className="font-medium">{errorMessage}</p>

          {insufficientStockItems.length > 0 && (
            <div className="mt-3">
              <p className="font-medium">Stock issues:</p>

              <ul className="mt-2 list-disc space-y-1 pl-5">
                {insufficientStockItems.map((item) => (
                  <li key={item.productId}>
                    <span className="font-medium">{item.productName}</span> — requested{' '}
                    {item.requested}, available {item.available}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <Card header={<h3 className="text-lg font-semibold text-gray-900">Items</h3>}>
        <div className="divide-y divide-gray-200">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-4 py-4 first:pt-0 last:pb-0">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-20 w-20 shrink-0 rounded-md object-cover"
                />
              ) : (
                <div
                  aria-hidden="true"
                  className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md bg-gray-100 text-xs text-gray-500"
                >
                  No image
                </div>
              )}

              <div className="min-w-0 flex-1">
                <h4 className="font-medium text-gray-900">{item.name}</h4>

                <p className="mt-1 text-sm text-gray-500">
                  ₹{item.price.toFixed(2)} × {item.quantity}
                </p>
              </div>

              <p className="font-medium text-gray-900">
                ₹{(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
      </Card>

      <Card header={<h3 className="text-lg font-semibold text-gray-900">Shipping Address</h3>}>
        <div className="text-sm leading-6 text-gray-600">
          <p className="font-medium text-gray-900">{shippingAddress.fullName}</p>

          <p>{shippingAddress.address}</p>

          <p>
            {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pin}
          </p>

          <p>Phone: {shippingAddress.phone}</p>
        </div>
      </Card>

      <Card header={<h3 className="text-lg font-semibold text-gray-900">Price Details</h3>}>
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>₹{subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm text-gray-600">
            <span>Tax (10%)</span>
            <span>₹{tax.toFixed(2)}</span>
          </div>

          <div className="flex justify-between border-t border-gray-200 pt-3 text-base font-bold text-gray-900">
            <span>Total</span>
            <span>₹{total.toFixed(2)}</span>
          </div>
        </div>
      </Card>

      <div className="flex flex-col-reverse gap-3 border-t border-gray-200 pt-5 sm:flex-row sm:justify-between">
        <Button type="button" variant="secondary" onClick={onBack} disabled={isLoading}>
          Back
        </Button>

        <Button type="button" onClick={onPlaceOrder} isLoading={isLoading}>
          Place Order
        </Button>
      </div>
    </div>
  );
}

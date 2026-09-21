/**
 * ============================================================
 * Order Confirmation — src/components/checkout/OrderConfirmation.tsx
 * ============================================================
 * Step 3 of the checkout flow.
 *
 * Responsibilities:
 *   - Confirm that the order was placed successfully
 *   - Display the generated order ID
 *   - Display the estimated delivery date
 *   - Allow the user to continue shopping
 *
 * The order ID and estimated delivery date come from the
 * Order API response and are passed down by CheckoutPage.
 * ============================================================
 */

import { CheckCircle2 } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

type OrderConfirmationProps = {
  readonly orderId: string;
  readonly estimatedDelivery: string | null;
  readonly onContinueShopping: () => void;
};

export function OrderConfirmation({
  orderId,
  estimatedDelivery,
  onContinueShopping,
}: OrderConfirmationProps) {
  const formattedDeliveryDate = estimatedDelivery
    ? new Date(estimatedDelivery).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'To be confirmed';

  return (
    <div className="mx-auto max-w-2xl">
      <Card>
        <div className="flex flex-col items-center p-6 text-center sm:p-8">
          <CheckCircle2 className="h-16 w-16 text-green-600" aria-hidden="true" />

          <h2 className="mt-5 text-2xl font-bold text-gray-900">Order Placed Successfully!</h2>

          <p className="mt-2 max-w-md text-sm text-gray-600">
            Thank you for your order. Your order has been successfully placed and is now being
            processed.
          </p>

          <div className="mt-6 w-full rounded-md bg-gray-50 p-4 text-left">
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
              <span className="text-sm font-medium text-gray-600">Order ID</span>

              <span className="break-all text-sm font-semibold text-gray-900 sm:text-right">
                {orderId}
              </span>
            </div>

            <div className="mt-3 flex flex-col gap-1 border-t border-gray-200 pt-3 sm:flex-row sm:justify-between">
              <span className="text-sm font-medium text-gray-600">Estimated Delivery</span>

              <span className="text-sm font-semibold text-gray-900">{formattedDeliveryDate}</span>
            </div>
          </div>

          <div className="mt-6">
            <Button type="button" size="lg" onClick={onContinueShopping}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

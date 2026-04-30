import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';

import { OrderConfirmation } from '@/components/checkout/OrderConfirmation';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { ShippingForm } from '@/components/checkout/ShippingForm';
import { createOrder } from '@/services/order.service';
import { clearCart, selectCartTotal } from '@/store/slices/cartSlice';
import { useAppDispatch, useAppSelector } from '@/store';
import type {
  CheckoutOrder,
  CreateOrderRequest,
  InsufficientStockIssue,
  ShippingAddress,
} from '@/types/checkout.types';

type CheckoutStep = 1 | 2 | 3;

type ApiErrorWithMetadata = Error & {
  code?: string;
  status?: number;
  details?: unknown[];
};

const initialShippingAddress: ShippingAddress = {
  fullName: '',
  address: '',
  city: '',
  state: '',
  pin: '',
  phone: '',
};

const stepLabels = ['Shipping', 'Summary', 'Confirmation'];

function formatEstimatedDelivery(createdAt: string) {
  const estimatedDate = new Date(createdAt);
  estimatedDate.setDate(estimatedDate.getDate() + 5);

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(estimatedDate);
}

function parseInsufficientStockIssues(details: unknown[]): InsufficientStockIssue[] {
  const issues = details
    .map((detail) => {
      if (!detail || typeof detail !== 'object') {
        return null;
      }

      const candidate = detail as Record<string, unknown>;
      let productId: string | null = null;
      if (typeof candidate.productId === 'string') {
        productId = candidate.productId;
      } else if (typeof candidate.field === 'string') {
        productId = candidate.field;
      }

      if (!productId) {
        return null;
      }

      const productName =
        typeof candidate.productName === 'string' ? candidate.productName : undefined;
      const requested = typeof candidate.requested === 'number' ? candidate.requested : undefined;
      const available = typeof candidate.available === 'number' ? candidate.available : undefined;

      let message = 'This product no longer has enough stock for the selected quantity.';
      if (requested !== undefined && available !== undefined) {
        message = `Requested ${requested}, only ${available} available.`;
      }
      if (typeof candidate.message === 'string') {
        message = candidate.message;
      }

      return {
        productId,
        productName,
        requested,
        available,
        message,
      } as InsufficientStockIssue;
    })
    .filter((issue): issue is InsufficientStockIssue => issue !== null);

  return issues;
}

export default function CheckoutPage() {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector((state) => state.cart.items);
  const cartTotal = useAppSelector(selectCartTotal);

  const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>(initialShippingAddress);
  const [order, setOrder] = useState<CheckoutOrder | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [insufficientStockIssues, setInsufficientStockIssues] = useState<InsufficientStockIssue[]>(
    []
  );
  useEffect(() => {
    document.title = 'Checkout | MERN E-Commerce';
  }, []);

  const estimatedDelivery = useMemo(
    () => (order ? formatEstimatedDelivery(order.createdAt) : ''),
    [order]
  );
  const progressPercentage = (currentStep / stepLabels.length) * 100;

  if (cartItems.length === 0 && currentStep !== 3) {
    return <Navigate to="/cart" replace />;
  }

  const handleShippingSubmit = (values: ShippingAddress) => {
    setShippingAddress(values);
    setCurrentStep(2);
    setErrorMessage(null);
    setInsufficientStockIssues([]);
  };

  const handleBackToShipping = () => {
    setCurrentStep(1);
    setErrorMessage(null);
    setInsufficientStockIssues([]);
  };

  const handlePlaceOrder = async () => {
    const payload: CreateOrderRequest = {
      items: cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      shippingAddress,
    };

    setIsSubmitting(true);
    setErrorMessage(null);
    setInsufficientStockIssues([]);

    try {
      const createdOrder = await createOrder(payload);
      setOrder(createdOrder);
      dispatch(clearCart());
      setCurrentStep(3);
    } catch (error) {
      const apiError: ApiErrorWithMetadata =
        error instanceof Error ? (error as ApiErrorWithMetadata) : new Error(String(error));

      if (apiError.status === 409 && apiError.code === 'INSUFFICIENT_STOCK') {
        const issues = parseInsufficientStockIssues(apiError.details ?? []);
        setInsufficientStockIssues(issues);
        setErrorMessage(apiError.message || 'Some items are out of stock.');
      } else {
        setErrorMessage(apiError.message || 'We could not place your order. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gray-900 py-6 text-white sm:py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-3xl border border-gray-700 bg-gray-800 p-6 shadow-md sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">
                Checkout
              </p>
              <h1 className="mt-3 text-3xl font-semibold text-white">Step {currentStep} of 3</h1>
              <p className="mt-2 max-w-2xl text-sm text-gray-300">
                Complete your shipping details, review the order, and confirm the purchase.
              </p>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400 sm:justify-between sm:text-xs">
                {stepLabels.map((label, index) => {
                  const stepNumber = index + 1;
                  const isReached = stepNumber <= currentStep;

                  return (
                    <div key={label} className="flex min-w-[88px] items-center gap-2 sm:min-w-0">
                      <span className={isReached ? 'text-white' : 'text-gray-400'}>{label}</span>
                      <span className={isReached ? 'text-gray-300' : 'text-gray-500'}>
                        0{stepNumber}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-gray-700">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </header>

        {currentStep === 1 ? (
          <ShippingForm defaultValues={shippingAddress} onSubmit={handleShippingSubmit} />
        ) : null}

        {currentStep === 2 ? (
          <OrderSummary
            cartItems={cartItems}
            totalAmount={cartTotal}
            shippingAddress={shippingAddress}
            isSubmitting={isSubmitting}
            errorMessage={errorMessage}
            insufficientStockIssues={insufficientStockIssues}
            onBack={handleBackToShipping}
            onPlaceOrder={handlePlaceOrder}
          />
        ) : null}

        {currentStep === 3 && order ? (
          <OrderConfirmation order={order} estimatedDelivery={estimatedDelivery} />
        ) : null}
      </div>
    </div>
  );
}

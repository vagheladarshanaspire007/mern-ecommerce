import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';

import { OrderConfirmation } from '@/components/checkout/OrderConfirmation';
import { OrderSummary, type InsufficientStockItem } from '@/components/checkout/OrderSummary';

import { ShippingForm, type ShippingAddress } from '@/components/checkout/ShippingForm';

import { Card } from '@/components/ui/Card';
import api from '@/services/api';
import { useAppSelector } from '@/store';
import { selectCartItems } from '@/store/slices/cartSlice';

type CheckoutStep = 1 | 2 | 3;

interface CreateOrderResponse {
  success: boolean;
  data: {
    order: {
      id: string;
      estimatedDelivery: string | null;
    };
  };
}

interface ApiError extends Error {
  code?: string;
  status?: number;
}

const CheckoutPage = () => {
  const navigate = useNavigate();
  //const dispatch = useAppDispatch();

  const cartItems = useAppSelector(selectCartItems);

  const [currentStep, setCurrentStep] = useState<CheckoutStep>(1);
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress | null>(null);

  const [orderId, setOrderId] = useState<string | null>(null);
  const [estimatedDelivery, setEstimatedDelivery] = useState<string | null>(null);

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [insufficientStockItems, setInsufficientStockItems] = useState<InsufficientStockItem[]>([]);

  /*
   * If the cart is empty, checkout cannot continue.
   *
   * currentStep !== 3 is important because a successful order
   * clears the cart before showing the confirmation step.
   */
  if (cartItems.length === 0 && currentStep !== 3) {
    return <Navigate to="/cart" replace />;
  }

  const handleShippingSubmit = (address: ShippingAddress) => {
    setShippingAddress(address);
    setErrorMessage(null);
    setInsufficientStockItems([]);
    setCurrentStep(2);
  };

  const handleBackToShipping = () => {
    setErrorMessage(null);
    setInsufficientStockItems([]);
    setCurrentStep(1);
  };

  const handlePlaceOrder = async () => {
    if (!shippingAddress || isPlacingOrder) {
      return;
    }

    setIsPlacingOrder(true);
    setErrorMessage(null);
    setInsufficientStockItems([]);

    try {
      const response = await api.post<CreateOrderResponse>('/orders', {
        items: cartItems.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        shippingAddress,
      });

      const order = response.data.data.order;

      setOrderId(order.id);
      setEstimatedDelivery(order.estimatedDelivery);
      setCurrentStep(3);
    } catch (error) {
      const apiError = error as ApiError;

      if (apiError.code === 'INSUFFICIENT_STOCK' || apiError.status === 409) {
        /*
         * The shared API client exposes the error code/status but
         * currently does not expose backend error details.
         *
         * CartItem already contains the latest known stock value,
         * so use it to identify products whose requested quantity
         * exceeds their available stock.
         */
        const stockIssues = cartItems
          .filter((item) => item.quantity > item.stock)
          .map((item) => ({
            productId: item.productId,
            productName: item.name,
            requested: item.quantity,
            available: item.stock,
          }));

        setInsufficientStockItems(stockIssues);

        setErrorMessage(
          stockIssues.length > 0
            ? 'Some items in your cart do not have enough stock. Please adjust the quantities and try again.'
            : 'One or more products no longer have sufficient stock. Please review your cart and try again.'
        );

        return;
      }

      setErrorMessage(apiError.message || 'Unable to place the order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  const stepTitles = ['Shipping', 'Review Order', 'Confirmation'];

  return (
    <div className="py-8 sm:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Checkout</h1>

          <p className="mt-1 text-sm text-gray-500">Complete your order in three simple steps.</p>
        </div>

        {/* Progress */}
        <Card className="mb-8">
          <div className="p-0">
            <div className="flex items-center justify-between">
              {stepTitles.map((title, index) => {
                const step = (index + 1) as CheckoutStep;
                const isActive = currentStep === step;
                const isCompleted = currentStep > step;

                return (
                  <div key={title} className="flex flex-1 items-center">
                    <div className="flex min-w-0 flex-1 flex-col items-center">
                      <div
                        className={[
                          'flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold',
                          isActive || isCompleted
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-500',
                        ].join(' ')}
                        aria-current={isActive ? 'step' : undefined}
                      >
                        {step}
                      </div>

                      <span
                        className={[
                          'mt-2 text-center text-xs font-medium sm:text-sm',
                          isActive ? 'text-blue-600' : 'text-gray-500',
                        ].join(' ')}
                      >
                        {title}
                      </span>
                    </div>

                    {index < stepTitles.length - 1 && (
                      <div
                        className={[
                          'mx-2 h-0.5 flex-1',
                          currentStep > step ? 'bg-blue-600' : 'bg-gray-200',
                        ].join(' ')}
                        aria-hidden="true"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <p className="mt-5 text-center text-sm font-medium text-gray-600">
              Step {currentStep} of 3
            </p>
          </div>
        </Card>

        {/* Step 1 */}
        {currentStep === 1 && (
          <Card>
            <ShippingForm initialValues={shippingAddress} onSubmit={handleShippingSubmit} />
          </Card>
        )}

        {/* Step 2 */}
        {currentStep === 2 && shippingAddress && (
          <OrderSummary
            items={cartItems}
            shippingAddress={shippingAddress}
            isLoading={isPlacingOrder}
            errorMessage={errorMessage}
            insufficientStockItems={insufficientStockItems}
            onBack={handleBackToShipping}
            onPlaceOrder={handlePlaceOrder}
          />
        )}

        {/* Step 3 */}
        {currentStep === 3 && orderId && (
          <OrderConfirmation
            orderId={orderId}
            estimatedDelivery={estimatedDelivery}
            onContinueShopping={handleContinueShopping}
          />
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;

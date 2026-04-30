import api from '@/services/api';
import type {
  CheckoutOrder,
  CreateOrderRequest,
  CreateOrderResponse,
} from '@/types/checkout.types';

export async function createOrder(payload: CreateOrderRequest): Promise<CheckoutOrder> {
  const response = await api.post<CreateOrderResponse>('/orders', payload);
  return response.data.data.order;
}

import api from '@/services/api';
import type {
  CreateOrderRequest,
  CreateOrderResult,
  CreateOrderResponse,
} from '@/types/checkout.types';

export async function createOrder(payload: CreateOrderRequest): Promise<CreateOrderResult> {
  const response = await api.post<CreateOrderResponse>('/orders', payload);
  return {
    order: response.data.data.order,
    message: response.data.message,
  };
}

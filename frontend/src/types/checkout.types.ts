export interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  phone: string;
}

export interface CreateOrderRequest {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  shippingAddress: ShippingAddress;
}

export interface CheckoutOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface CheckoutOrder {
  id: string;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  totalAmount: number;
  shippingAddress: ShippingAddress;
  items: CheckoutOrderItem[];
  createdAt: string;
}

export interface CreateOrderResponse {
  success: true;
  data: {
    order: CheckoutOrder;
  };
}

export interface InsufficientStockIssue {
  productId: string;
  productName?: string;
  requested?: number;
  available?: number;
  message: string;
}

export type InsufficientStockDetail = {
  productId: string;
  productName: string;
  requested: number;
  available: number;
};

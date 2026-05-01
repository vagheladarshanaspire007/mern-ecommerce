import api from './api';
import type { Order, OrderStatus } from '@/types/auth.types';

export interface AdminOrder extends Order {
  itemCount?: number;
  updatedAt?: string;
}

export interface AdminUserRecord {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'admin' | 'manager';
  createdAt: string;
  updatedAt: string;
}

type OrdersResponse = {
  data: {
    items: AdminOrder[];
  };
};

type UsersResponse = {
  data: {
    items: AdminUserRecord[];
  };
};

type UpdateOrderStatusResponse = {
  data: {
    orderId: string;
    userId: string;
    status: OrderStatus;
  };
};

export const adminService = {
  async listOrders(limit = 8): Promise<AdminOrder[]> {
    const response = await api.get<OrdersResponse>('/orders', {
      params: { page: 1, limit },
    });

    return response.data.data.items;
  },

  async listUsers(): Promise<AdminUserRecord[]> {
    const response = await api.get<UsersResponse>('/users');
    return response.data.data.items;
  },

  async updateOrderStatus(
    orderId: string,
    status: 'pending' | 'shipped' | 'delivered' | 'cancelled'
  ): Promise<OrderStatus> {
    const response = await api.patch<UpdateOrderStatusResponse>(`/orders/${orderId}/status`, {
      status,
    });

    return response.data.data.status;
  },
};

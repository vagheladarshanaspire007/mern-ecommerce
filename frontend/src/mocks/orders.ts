import type { Order } from '@/types/auth.types';

export const mockOrders: Order[] = [
  {
    id: 'ORD-10482',
    userId: 'user-123',
    totalAmount: 186.5,
    status: 'delivered',
    createdAt: '2026-03-18T10:24:00.000Z',
    items: [],
  },
  {
    id: 'ORD-10437',
    userId: 'user-123',
    totalAmount: 92.0,
    status: 'processing',
    createdAt: '2026-03-05T15:12:00.000Z',
    items: [],
  },
  {
    id: 'ORD-10391',
    userId: 'user-123',
    totalAmount: 249.99,
    status: 'shipped',
    createdAt: '2026-02-22T08:45:00.000Z',
    items: [],
  },
  {
    id: 'ORD-10344',
    userId: 'user-123',
    totalAmount: 58.75,
    status: 'cancelled',
    createdAt: '2026-02-08T13:05:00.000Z',
    items: [],
  },
];

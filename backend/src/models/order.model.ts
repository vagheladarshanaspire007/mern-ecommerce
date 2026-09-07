import { PoolClient } from 'pg';
import { query } from '../config/database';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface OrderItemInput {
  productId: string;
  quantity: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: string;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: string;
  createdAt: Date;
  updatedAt: Date;
  items?: OrderItem[];
}

export const OrderModel = {
  create: async (client: PoolClient, userId: string, totalAmount: number): Promise<Order> => {
    const result = await client.query<Order>(
      `INSERT INTO orders (user_id, total_amount)
       VALUES ($1, $2)
       RETURNING
         id,
         user_id AS "userId",
         status,
         total_amount AS "totalAmount",
         created_at AS "createdAt",
         updated_at AS "updatedAt"`,
      [userId, totalAmount]
    );

    return result.rows[0];
  },

  createItem: async (
    client: PoolClient,
    orderId: string,
    productId: string,
    quantity: number,
    unitPrice: string
  ): Promise<void> => {
    await client.query(
      `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
       VALUES ($1, $2, $3, $4)`,
      [orderId, productId, quantity, unitPrice]
    );
  },

  findByUser: async (userId: string, limit: number, offset: number): Promise<Order[]> => {
    const result = await query<Order>(
      `SELECT
         id,
         user_id AS "userId",
         status,
         total_amount AS "totalAmount",
         created_at AS "createdAt",
         updated_at AS "updatedAt"
       FROM orders
       WHERE user_id = $1
       ORDER BY created_at DESC, id DESC
       LIMIT $2 OFFSET $3`,
      [userId, limit, offset]
    );

    return result.rows;
  },

  countByUser: async (userId: string): Promise<number> => {
    const result = await query<{ count: string }>(
      'SELECT COUNT(*)::text AS count FROM orders WHERE user_id = $1',
      [userId]
    );

    return Number(result.rows[0]?.count ?? 0);
  },

  findByIdForUser: async (orderId: string, userId: string): Promise<Order | null> => {
    const result = await query<Order>(
      `SELECT
         o.id,
         o.user_id AS "userId",
         o.status,
         o.total_amount AS "totalAmount",
         o.created_at AS "createdAt",
         o.updated_at AS "updatedAt",
         COALESCE(
           json_agg(
             json_build_object(
               'id', oi.id,
               'orderId', oi.order_id,
               'productId', oi.product_id,
               'productName', p.name,
               'quantity', oi.quantity,
               'unitPrice', oi.unit_price
             )
             ORDER BY oi.id
           ) FILTER (WHERE oi.id IS NOT NULL),
           '[]'
         ) AS items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN products p ON p.id = oi.product_id
       WHERE o.id = $1 AND o.user_id = $2
       GROUP BY o.id`,
      [orderId, userId]
    );

    return result.rows[0] ?? null;
  },

  updateStatus: async (orderId: string, status: OrderStatus): Promise<Order | null> => {
    const result = await query<Order>(
      `UPDATE orders
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING
         id,
         user_id AS "userId",
         status,
         total_amount AS "totalAmount",
         created_at AS "createdAt",
         updated_at AS "updatedAt"`,
      [status, orderId]
    );

    return result.rows[0] ?? null;
  },
};

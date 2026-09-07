import { withTransaction } from '../config/database';
import { getIO } from '../config/socket';
import { AppError } from '../utils/AppError';
import {
  OrderModel,
  type Order,
  type OrderItemInput,
  type OrderStatus,
} from '../models/order.model';

interface ProductRow {
  id: string;
  name: string;
  price: string;
  stock: number;
  isActive: boolean;
}

interface InsufficientStock {
  productId: string;
  productName: string;
  requested: number;
  available: number;
}

const VALID_STATUSES = new Set<OrderStatus>([
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]);

export const OrderService = {
  create: async (userId: string, items: OrderItemInput[]): Promise<Order> =>
    withTransaction(async (client) => {
      const productIds = [...new Set(items.map((item) => item.productId))];

      const productResult = await client.query<ProductRow>(
        `SELECT
           id,
           name,
           price,
           stock,
           is_active AS "isActive"
         FROM products
         WHERE id = ANY($1::uuid[])
         FOR UPDATE`,
        [productIds]
      );

      const products = new Map(productResult.rows.map((product) => [product.id, product]));
      const insufficientStock: InsufficientStock[] = [];
      let total = 0;

      for (const item of items) {
        const product = products.get(item.productId);

        if (!product?.isActive) {
          insufficientStock.push({
            productId: item.productId,
            productName: product?.name ?? 'Unknown product',
            requested: item.quantity,
            available: product?.stock ?? 0,
          });
          continue;
        }

        if (item.quantity > product.stock) {
          insufficientStock.push({
            productId: product.id,
            productName: product.name,
            requested: item.quantity,
            available: product.stock,
          });
          continue;
        }

        total += Number(product.price) * item.quantity;
      }

      if (insufficientStock.length > 0) {
        throw new AppError(
          409,
          'INSUFFICIENT_STOCK',
          'Insufficient stock for one or more products',
          insufficientStock
        );
      }

      const order = await OrderModel.create(client, userId, total);

      for (const item of items) {
        const product = products.get(item.productId);

        if (!product) {
          throw new AppError(409, 'INSUFFICIENT_STOCK', 'Product is no longer available', [
            {
              productId: item.productId,
              productName: 'Unknown product',
              requested: item.quantity,
              available: 0,
            },
          ]);
        }

        await client.query(
          `UPDATE products
           SET stock = stock - $1, updated_at = NOW()
           WHERE id = $2`,
          [item.quantity, product.id]
        );

        await OrderModel.createItem(client, order.id, product.id, item.quantity, product.price);
      }

      return OrderModel.findByIdForUser(order.id, userId) as Promise<Order>;
    }),

  list: async (userId: string, page: number, limit: number) => {
    const offset = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      OrderModel.findByUser(userId, limit, offset),
      OrderModel.countByUser(userId),
    ]);

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  getById: async (orderId: string, userId: string): Promise<Order> => {
    const order = await OrderModel.findByIdForUser(orderId, userId);

    if (!order) {
      throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found');
    }

    return order;
  },

  updateStatus: async (orderId: string, status: OrderStatus): Promise<Order> => {
    if (!VALID_STATUSES.has(status)) {
      throw new AppError(400, 'INVALID_ORDER_STATUS', 'Invalid order status');
    }

    const order = await OrderModel.updateStatus(orderId, status);

    if (!order) {
      throw new AppError(404, 'ORDER_NOT_FOUND', 'Order not found');
    }

    getIO().to(`user:${order.userId}`).emit('order:status-updated', {
      orderId: order.id,
      status: order.status,
    });

    return order;
  },
};

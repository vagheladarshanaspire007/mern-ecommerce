import { PoolClient } from 'pg';
import { withTransaction } from '../config/database';
import { AppError } from '../utils/AppError';
import { getIO } from '../config/socket';
import {
  type InsufficientStockDetail,
  type OrderDetail,
  type OrderStatus,
  type ShippingAddress,
} from '../models/order.model';
import { t } from '../utils/i18n';
import { ORDER_MESSAGES } from '../constants/messages';

type CheckoutItem = {
  productId: string;
  quantity: number;
};

type CreateOrderServiceInput = {
  userId: string;
  items: CheckoutItem[];
  shippingAddress: ShippingAddress;
};

type CreateOrderServiceResult = {
  order: OrderDetail;
};

type OrderListResult = {
  data: OrderDetail[];
  total: number;
  page: number;
  limit: number;
};

type UpdateOrderStatusInput = {
  orderId: string;
  status: OrderStatus;
  actorRole: string;
};

type OrderRow = {
  id: string;
  user_id: string;
  status: OrderStatus;
  total_amount: string;
  shipping_full_name: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_pin: string | null;
  shipping_phone: string | null;
  created_at: string;
  updated_at: string;
};

type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: string;
  total_price: string;
  created_at: string;
};

type LockedProductRow = {
  id: string;
  name: string;
  price: string;
  stock: number;
};

const mapShippingAddress = (row: OrderRow): ShippingAddress => ({
  fullName: row.shipping_full_name ?? '',
  address: row.shipping_address ?? '',
  city: row.shipping_city ?? '',
  state: row.shipping_state ?? '',
  pin: row.shipping_pin ?? '',
  phone: row.shipping_phone ?? '',
});

const mapOrder = (orderRow: OrderRow, itemRows: OrderItemRow[]): OrderDetail => ({
  id: orderRow.id,
  userId: orderRow.user_id,
  status: orderRow.status,
  totalAmount: Number(orderRow.total_amount),
  shippingAddress: mapShippingAddress(orderRow),
  createdAt: orderRow.created_at,
  updatedAt: orderRow.updated_at,
  itemCount: itemRows.length,
  items: itemRows.map((item) => ({
    id: item.id,
    orderId: item.order_id,
    productId: item.product_id,
    productName: item.product_name,
    quantity: item.quantity,
    unitPrice: Number(item.unit_price),
    lineTotal: Number(item.total_price),
    createdAt: item.created_at,
  })),
});

const buildInsufficientStockError = (
  requestedItems: CheckoutItem[],
  lockedProducts: LockedProductRow[]
): InsufficientStockDetail[] => {
  const productById = new Map(lockedProducts.map((p) => [p.id, p]));

  return requestedItems
    .map((item) => {
      const product = productById.get(item.productId);

      if (!product) {
        return {
          productId: item.productId,
          productName: 'Unknown product',
          requested: item.quantity,
          available: 0,
        };
      }

      if (product.stock >= item.quantity) {
        return null;
      }

      return {
        productId: product.id,
        productName: product.name,
        requested: item.quantity,
        available: product.stock,
      };
    })
    .filter((value): value is InsufficientStockDetail => value !== null);
};

const validateOrderItems = (
  requestedItems: CheckoutItem[],
  lockedProducts: LockedProductRow[]
): void => {
  const missingProductIds = requestedItems
    .filter((item) => !lockedProducts.some((product) => product.id === item.productId))
    .map((item) => item.productId);

  if (missingProductIds.length > 0) {
    throw new AppError(400, 'PRODUCT_NOT_FOUND', 'One or more products were not found', {
      productIds: missingProductIds,
    });
  }

  const stockFailures = buildInsufficientStockError(requestedItems, lockedProducts);

  if (stockFailures.length > 0) {
    throw new AppError(
      409,
      'INSUFFICIENT_STOCK',
      t(ORDER_MESSAGES.INSUFFICIENT_STOCK),
      stockFailures
    );
  }
};

const calculateTotalAmount = (
  requestedItems: CheckoutItem[],
  lockedProducts: LockedProductRow[]
): number => {
  const productById = new Map(lockedProducts.map((p) => [p.id, p]));

  return requestedItems.reduce((sum, item) => {
    const product = productById.get(item.productId);
    if (!product) return sum;
    return sum + Number(product.price) * item.quantity;
  }, 0);
};

const buildOrderItemInsertRows = (
  requestedItems: CheckoutItem[],
  lockedProducts: LockedProductRow[]
) => {
  const productById = new Map(lockedProducts.map((p) => [p.id, p]));

  return requestedItems.map((item) => {
    const product = productById.get(item.productId);

    if (!product) {
      throw new AppError(400, 'PRODUCT_NOT_FOUND', 'One or more products were not found');
    }

    return {
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: Number(product.price),
      lineTotal: Number(product.price) * item.quantity,
    };
  });
};

const loadOrderById = async (client: PoolClient, orderId: string): Promise<OrderDetail | null> => {
  const orderResult = await client.query<OrderRow>(
    `
      SELECT
        id,
        user_id,
        status,
        total_amount::text AS total_amount,
        shipping_full_name,
        shipping_address,
        shipping_city,
        shipping_state,
        shipping_pin,
        shipping_phone,
        created_at::text AS created_at,
        updated_at::text AS updated_at
      FROM orders
      WHERE id = $1
      LIMIT 1
    `,
    [orderId]
  );

  const orderRow = orderResult.rows[0];
  if (!orderRow) return null;

  const itemResult = await client.query<OrderItemRow>(
    `
      SELECT
        oi.id,
        oi.order_id,
        oi.product_id,
        p.name AS product_name,
        oi.quantity,
        oi.unit_price::text AS unit_price,
        oi.total_price::text AS total_price,
        oi.created_at::text AS created_at
      FROM order_items oi
      INNER JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = $1
      ORDER BY oi.created_at ASC, oi.id ASC
    `,
    [orderId]
  );

  return mapOrder(orderRow, itemResult.rows);
};

export async function createOrderService(
  input: CreateOrderServiceInput
): Promise<CreateOrderServiceResult> {
  return withTransaction(async (client) => {
    if (input.items.length === 0) {
      throw new AppError(400, 'INVALID_ORDER', 'At least one order item is required');
    }

    const productIds = input.items.map((item) => item.productId);

    const lockedProducts = await client.query<LockedProductRow>(
      `
        SELECT id, name, price::text AS price, stock
        FROM products
        WHERE id = ANY($1::uuid[])
          AND is_active = TRUE
        FOR UPDATE
      `,
      [productIds]
    );

    validateOrderItems(input.items, lockedProducts.rows);

    const totalAmount = calculateTotalAmount(input.items, lockedProducts.rows);
    const orderItems = buildOrderItemInsertRows(input.items, lockedProducts.rows);

    const orderResult = await client.query<OrderRow>(
      `
        INSERT INTO orders (
          user_id,
          status,
          total_amount,
          shipping_full_name,
          shipping_address,
          shipping_city,
          shipping_state,
          shipping_pin,
          shipping_phone
        )
        VALUES ($1, 'pending', $2, $3, $4, $5, $6, $7, $8)
        RETURNING
          id,
          user_id,
          status,
          total_amount::text AS total_amount,
          shipping_full_name,
          shipping_address,
          shipping_city,
          shipping_state,
          shipping_pin,
          shipping_phone,
          created_at::text AS created_at,
          updated_at::text AS updated_at
      `,
      [
        input.userId,
        totalAmount.toFixed(2),
        input.shippingAddress.fullName,
        input.shippingAddress.address,
        input.shippingAddress.city,
        input.shippingAddress.state,
        input.shippingAddress.pin,
        input.shippingAddress.phone,
      ]
    );

    const orderRow = orderResult.rows[0];

    for (const item of orderItems) {
      await client.query(
        `
          INSERT INTO order_items (
            order_id,
            product_id,
            quantity,
            unit_price
          )
          VALUES ($1, $2, $3, $4)
        `,
        [orderRow.id, item.productId, item.quantity, item.unitPrice.toFixed(2)]
      );

      await client.query(
        `
          UPDATE products
          SET stock = stock - $2,
              updated_at = NOW()
          WHERE id = $1
        `,
        [item.productId, item.quantity]
      );
    }

    const order = await loadOrderById(client, orderRow.id);

    if (!order) {
      throw new AppError(500, 'ORDER_CREATE_FAILED', 'Failed to create order');
    }

    return { order };
  });
}

export async function listOrdersService(
  userId: string,
  page: number,
  limit: number
): Promise<OrderListResult> {
  return withTransaction(async (client) => {
    const offset = (page - 1) * limit;

    const countResult = await client.query<{ count: string }>(
      `
        SELECT COUNT(*)::text AS count
        FROM orders
        WHERE user_id = $1
      `,
      [userId]
    );

    const orderResult = await client.query<OrderRow>(
      `
        SELECT
          id,
          user_id,
          status,
          total_amount::text AS total_amount,
          shipping_full_name,
          shipping_address,
          shipping_city,
          shipping_state,
          shipping_pin,
          shipping_phone,
          created_at::text AS created_at,
          updated_at::text AS updated_at
        FROM orders
        WHERE user_id = $1
        ORDER BY created_at DESC, id DESC
        LIMIT $2 OFFSET $3
      `,
      [userId, limit, offset]
    );

    const orders: OrderDetail[] = [];

    for (const orderRow of orderResult.rows) {
      const itemsResult = await client.query<OrderItemRow>(
        `
          SELECT
            oi.id,
            oi.order_id,
            oi.product_id,
            p.name AS product_name,
            oi.quantity,
            oi.unit_price::text AS unit_price,
            oi.total_price::text AS total_price,
            oi.created_at::text AS created_at
          FROM order_items oi
          INNER JOIN products p ON p.id = oi.product_id
          WHERE oi.order_id = $1
          ORDER BY oi.created_at ASC, oi.id ASC
        `,
        [orderRow.id]
      );

      orders.push(mapOrder(orderRow, itemsResult.rows));
    }

    return {
      data: orders,
      total: Number(countResult.rows[0]?.count ?? 0),
      page,
      limit,
    };
  });
}

export async function getOrderDetailService(
  userId: string,
  orderId: string,
  isAdmin = false
): Promise<OrderDetail> {
  return withTransaction(async (client) => {
    const orderResult = await client.query<OrderRow>(
      `
        SELECT
          id,
          user_id,
          status,
          total_amount::text AS total_amount,
          shipping_full_name,
          shipping_address,
          shipping_city,
          shipping_state,
          shipping_pin,
          shipping_phone,
          created_at::text AS created_at,
          updated_at::text AS updated_at
        FROM orders
        WHERE id = $1
        LIMIT 1
      `,
      [orderId]
    );

    const orderRow = orderResult.rows[0];

    if (!orderRow) {
      throw new AppError(404, 'ORDER_NOT_FOUND', t(ORDER_MESSAGES.ORDER_NOT_FOUND));
    }

    if (!isAdmin && orderRow.user_id !== userId) {
      throw new AppError(403, 'FORBIDDEN', t(ORDER_MESSAGES.FORBIDDEN));
    }

    const itemResult = await client.query<OrderItemRow>(
      `
        SELECT
          oi.id,
          oi.order_id,
          oi.product_id,
          p.name AS product_name,
          oi.quantity,
          oi.unit_price::text AS unit_price,
          oi.total_price::text AS total_price,
          oi.created_at::text AS created_at
        FROM order_items oi
        INNER JOIN products p ON p.id = oi.product_id
        WHERE oi.order_id = $1
        ORDER BY oi.created_at ASC, oi.id ASC
      `,
      [orderId]
    );

    return mapOrder(orderRow, itemResult.rows);
  });
}

export async function updateOrderStatusService(
  input: UpdateOrderStatusInput
): Promise<{ id: string; userId: string; status: OrderStatus }> {
  if (input.actorRole !== 'admin') {
    throw new AppError(403, 'FORBIDDEN', t(ORDER_MESSAGES.FORBIDDEN));
  }

  return withTransaction(async (client) => {
    const result = await client.query<{ id: string; user_id: string; status: OrderStatus }>(
      `
        UPDATE orders
        SET status = $2,
            updated_at = NOW()
        WHERE id = $1
        RETURNING id, user_id, status
      `,
      [input.orderId, input.status]
    );

    const row = result.rows[0];

    if (!row) {
      throw new AppError(404, 'ORDER_NOT_FOUND', t(ORDER_MESSAGES.ORDER_NOT_FOUND));
    }

    const io = getIO();
    io.to(`user:${row.user_id}`).emit('order:status-updated', {
      orderId: row.id,
      status: row.status,
    });

    return {
      id: row.id,
      userId: row.user_id,
      status: row.status,
    };
  });
}

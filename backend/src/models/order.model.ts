import { query } from '../config/database';

export type OrderStatus = 'pending' | 'shipped' | 'delivered' | 'cancelled';

export type ShippingAddress = {
  fullName: string;
  address: string;
  city: string;
  state: string;
  pin: string;
  phone: string;
};

export type CreateOrderItemInput = {
  productId: string;
  quantity: number;
};

export type CreateOrderInput = {
  userId: string;
  items: CreateOrderItemInput[];
  shippingAddress: ShippingAddress;
  totalAmount: number;
};

export type InsufficientStockDetail = {
  productId: string;
  productName: string;
  requested: number;
  available: number;
};

export type OrderSummary = {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  shippingAddress: ShippingAddress;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
};

export type OrderItemDetail = {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  createdAt: string;
};

export type OrderDetail = OrderSummary & {
  items: OrderItemDetail[];
};

type ProductStockRow = {
  id: string;
  name: string;
  price: string;
  stock: number;
};

type OrderSummaryRow = {
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
  item_count: string;
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

const mapShippingAddress = (row: {
  shipping_full_name: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_pin: string | null;
  shipping_phone: string | null;
}): ShippingAddress => ({
  fullName: row.shipping_full_name ?? '',
  address: row.shipping_address ?? '',
  city: row.shipping_city ?? '',
  state: row.shipping_state ?? '',
  pin: row.shipping_pin ?? '',
  phone: row.shipping_phone ?? '',
});

const mapOrderSummaryRow = (row: OrderSummaryRow): OrderSummary => ({
  id: row.id,
  userId: row.user_id,
  status: row.status,
  totalAmount: Number(row.total_amount),
  shippingAddress: mapShippingAddress(row),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  itemCount: Number(row.item_count),
});

const mapOrderItemRow = (row: OrderItemRow): OrderItemDetail => ({
  id: row.id,
  orderId: row.order_id,
  productId: row.product_id,
  productName: row.product_name,
  quantity: row.quantity,
  unitPrice: Number(row.unit_price),
  lineTotal: Number(row.total_price),
  createdAt: row.created_at,
});

export async function findProductsForOrder(
  items: CreateOrderItemInput[]
): Promise<ProductStockRow[]> {
  if (items.length === 0) return [];

  const productIds = items.map((item) => item.productId);

  const result = await query<ProductStockRow>(
    `
      SELECT id, name, price::text AS price, stock
      FROM products
      WHERE id = ANY($1::uuid[])
        AND is_active = TRUE
      FOR UPDATE
    `,
    [productIds]
  );

  return result.rows;
}

export async function createOrder(input: CreateOrderInput): Promise<{ id: string }> {
  const result = await query<{ id: string }>(
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
      RETURNING id
    `,
    [
      input.userId,
      input.totalAmount.toFixed(2),
      input.shippingAddress.fullName,
      input.shippingAddress.address,
      input.shippingAddress.city,
      input.shippingAddress.state,
      input.shippingAddress.pin,
      input.shippingAddress.phone,
    ]
  );

  return result.rows[0];
}

export async function createOrderItems(
  orderId: string,
  items: CreateOrderItemInput[],
  productRows: ProductStockRow[]
): Promise<void> {
  for (const item of items) {
    const product = productRows.find((row) => row.id === item.productId);
    if (!product) continue;

    await query(
      `
        INSERT INTO order_items (
          order_id,
          product_id,
          quantity,
          unit_price
        )
        VALUES ($1, $2, $3, $4)
      `,
      [orderId, item.productId, item.quantity, product.price]
    );
  }
}

export async function decrementProductStock(items: CreateOrderItemInput[]): Promise<void> {
  for (const item of items) {
    await query(
      `
        UPDATE products
        SET stock = stock - $2,
            updated_at = NOW()
        WHERE id = $1
      `,
      [item.productId, item.quantity]
    );
  }
}

export async function getUserOrders(
  userId: string,
  page: number,
  limit: number
): Promise<{ data: OrderSummary[]; total: number }> {
  const offset = (page - 1) * limit;

  const countResult = await query<{ count: string }>(
    `
      SELECT COUNT(*)::text AS count
      FROM orders
      WHERE user_id = $1
    `,
    [userId]
  );

  const result = await query<OrderSummaryRow>(
    `
      SELECT
        o.id,
        o.user_id,
        o.status,
        o.total_amount::text AS total_amount,
        o.shipping_full_name,
        o.shipping_address,
        o.shipping_city,
        o.shipping_state,
        o.shipping_pin,
        o.shipping_phone,
        o.created_at::text AS created_at,
        o.updated_at::text AS updated_at,
        COUNT(oi.id)::text AS item_count
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE o.user_id = $1
      GROUP BY o.id
      ORDER BY o.created_at DESC, o.id DESC
      LIMIT $2 OFFSET $3
    `,
    [userId, limit, offset]
  );

  return {
    data: result.rows.map(mapOrderSummaryRow),
    total: Number(countResult.rows[0]?.count ?? 0),
  };
}

export async function getOrderById(orderId: string): Promise<OrderSummary | null> {
  const result = await query<OrderSummaryRow>(
    `
      SELECT
        o.id,
        o.user_id,
        o.status,
        o.total_amount::text AS total_amount,
        o.shipping_full_name,
        o.shipping_address,
        o.shipping_city,
        o.shipping_state,
        o.shipping_pin,
        o.shipping_phone,
        o.created_at::text AS created_at,
        o.updated_at::text AS updated_at,
        COUNT(oi.id)::text AS item_count
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE o.id = $1
      GROUP BY o.id
      LIMIT 1
    `,
    [orderId]
  );

  return result.rows[0] ? mapOrderSummaryRow(result.rows[0]) : null;
}

export async function getOrderDetail(orderId: string): Promise<OrderDetail | null> {
  const orderResult = await query<OrderSummaryRow>(
    `
      SELECT
        o.id,
        o.user_id,
        o.status,
        o.total_amount::text AS total_amount,
        o.shipping_full_name,
        o.shipping_address,
        o.shipping_city,
        o.shipping_state,
        o.shipping_pin,
        o.shipping_phone,
        o.created_at::text AS created_at,
        o.updated_at::text AS updated_at,
        COUNT(oi.id)::text AS item_count
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id = o.id
      WHERE o.id = $1
      GROUP BY o.id
      LIMIT 1
    `,
    [orderId]
  );

  const orderRow = orderResult.rows[0];
  if (!orderRow) return null;

  const itemsResult = await query<OrderItemRow>(
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

  return {
    ...mapOrderSummaryRow(orderRow),
    items: itemsResult.rows.map(mapOrderItemRow),
  };
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<{ id: string; userId: string; status: OrderStatus } | null> {
  const result = await query<{ id: string; user_id: string; status: OrderStatus }>(
    `
      UPDATE orders
      SET status = $2,
          updated_at = NOW()
      WHERE id = $1
      RETURNING id, user_id, status
    `,
    [orderId, status]
  );

  const row = result.rows[0];
  if (!row) return null;

  return {
    id: row.id,
    userId: row.user_id,
    status: row.status,
  };
}

export async function lockOrderProducts(items: CreateOrderItemInput[]) {
  return findProductsForOrder(items);
}

export async function insertOrderWithItems(input: CreateOrderInput): Promise<OrderDetail | null> {
  const order = await createOrder(input);
  const productRows = await findProductsForOrder(input.items);

  if (productRows.length === 0) return null;

  await createOrderItems(order.id, input.items, productRows);
  await decrementProductStock(input.items);

  return getOrderDetail(order.id);
}

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import seedData from '../../../docs/seed-data.json';
import { connectDB, withTransaction } from '../config/database';
import { logger } from './logger';

type UserRole = 'user' | 'admin';
type OrderStatus = 'pending' | 'shipped' | 'delivered' | 'cancelled';

type SeedUser = {
  key: string;
  first_name: string;
  last_name: string;
  email: string;
  role: UserRole;
  address: string;
};

type SeedCategory = {
  key: string;
  name: string;
  slug: string;
};

type SeedProduct = {
  key: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryKey: string;
  imageUrls: string[];
};

type SeedOrder = {
  key: string;
  userEmail: string;
  status: OrderStatus;
};

type SeedOrderItem = {
  orderKey: string;
  productKey: string;
  quantity: number;
  unitPrice: number;
};

type SeedReview = {
  productKey: string;
  userEmail: string;
  rating: number;
  reviewText: string;
};

type SeedCartItem = {
  userEmail: string;
  productKey: string;
  quantity: number;
};

type SeedShape = {
  users: SeedUser[];
  categories: SeedCategory[];
  products: SeedProduct[];
  orders: SeedOrder[];
  orderItems: SeedOrderItem[];
  reviews: SeedReview[];
  cartItems: SeedCartItem[];
};

function assertFound<T>(value: T | undefined, message: string): T {
  if (!value) {
    throw new Error(message);
  }
  return value;
}

async function clearSeedTables(client: import('pg').PoolClient) {
  await client.query(`
    TRUNCATE TABLE
      cart_items,
      reviews,
      order_items,
      orders,
      products,
      categories,
      users
    CASCADE;
  `);
}

async function seedUsers(
  client: import('pg').PoolClient,
  users: SeedUser[],
  passwordHash: string
): Promise<Map<string, string>> {
  const userIdByEmail = new Map<string, string>();

  for (const user of users) {
    const result = await client.query<{ id: string }>(
      `
        INSERT INTO users (first_name, last_name, email, password_hash, address, role)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `,
      [user.first_name, user.last_name, user.email, passwordHash, user.address, user.role]
    );

    userIdByEmail.set(user.email, result.rows[0].id);
  }

  return userIdByEmail;
}

async function seedCategories(
  client: import('pg').PoolClient,
  categories: SeedCategory[]
): Promise<Map<string, string>> {
  const categoryIdByKey = new Map<string, string>();

  for (const category of categories) {
    const result = await client.query<{ id: string }>(
      `
        INSERT INTO categories (name, slug)
        VALUES ($1, $2)
        RETURNING id
      `,
      [category.name, category.slug]
    );

    categoryIdByKey.set(category.key, result.rows[0].id);
  }

  return categoryIdByKey;
}

async function seedProducts(
  client: import('pg').PoolClient,
  products: SeedProduct[],
  categoryIdByKey: Map<string, string>
): Promise<Map<string, { id: string; name: string; price: string; image: string | null }>> {
  const productByKey = new Map<
    string,
    { id: string; name: string; price: string; image: string | null }
  >();

  for (const product of products) {
    const categoryId = assertFound(
      categoryIdByKey.get(product.categoryKey),
      `Missing category for product key: ${product.key}`
    );

    const result = await client.query<{
      id: string;
      name: string;
      price: string;
      image_urls: string[];
    }>(
      `
        INSERT INTO products (name, description, image_urls, price, stock, category_id)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, name, price, image_urls
      `,
      [
        product.name,
        product.description,
        product.imageUrls,
        product.price.toFixed(2),
        product.stock,
        categoryId,
      ]
    );

    const inserted = result.rows[0];
    productByKey.set(product.key, {
      id: inserted.id,
      name: inserted.name,
      price: inserted.price,
      image: inserted.image_urls[0] ?? null,
    });
  }

  return productByKey;
}

async function seedOrders(
  client: import('pg').PoolClient,
  orders: SeedOrder[],
  userIdByEmail: Map<string, string>
): Promise<Map<string, string>> {
  const orderIdByKey = new Map<string, string>();

  for (const order of orders) {
    const userId = assertFound(
      userIdByEmail.get(order.userEmail),
      `Missing user for order key: ${order.key}`
    );

    const result = await client.query<{ id: string }>(
      `
        INSERT INTO orders (user_id, status)
        VALUES ($1, $2)
        RETURNING id
      `,
      [userId, order.status]
    );

    orderIdByKey.set(order.key, result.rows[0].id);
  }

  return orderIdByKey;
}

async function seedOrderItems(
  client: import('pg').PoolClient,
  orderItems: SeedOrderItem[],
  orderIdByKey: Map<string, string>,
  productByKey: Map<string, { id: string; name: string; price: string; image: string | null }>
) {
  for (const item of orderItems) {
    const orderId = assertFound(
      orderIdByKey.get(item.orderKey),
      `Missing order for item orderKey: ${item.orderKey}`
    );
    const product = assertFound(
      productByKey.get(item.productKey),
      `Missing product for item productKey: ${item.productKey}`
    );

    await client.query(
      `
        INSERT INTO order_items (order_id, product_id, quantity, unit_price)
        VALUES ($1, $2, $3, $4)
      `,
      [orderId, product.id, item.quantity, item.unitPrice.toFixed(2)]
    );
  }

  await client.query(`
    UPDATE orders o
    SET total_amount = COALESCE(agg.order_total, 0)
    FROM (
      SELECT order_id, ROUND(SUM(total_price), 2) AS order_total
      FROM order_items
      GROUP BY order_id
    ) AS agg
    WHERE o.id = agg.order_id;
  `);
}

async function seedReviews(
  client: import('pg').PoolClient,
  reviews: SeedReview[],
  userIdByEmail: Map<string, string>,
  productByKey: Map<string, { id: string; name: string; price: string; image: string | null }>
) {
  for (const review of reviews) {
    const userId = assertFound(
      userIdByEmail.get(review.userEmail),
      `Missing user for review userEmail: ${review.userEmail}`
    );
    const product = assertFound(
      productByKey.get(review.productKey),
      `Missing product for review productKey: ${review.productKey}`
    );

    await client.query(
      `
        INSERT INTO reviews (product_id, user_id, rating, review_text)
        VALUES ($1, $2, $3, $4)
      `,
      [product.id, userId, review.rating, review.reviewText]
    );
  }
}

async function seedCartItems(
  client: import('pg').PoolClient,
  cartItems: SeedCartItem[],
  userIdByEmail: Map<string, string>,
  productByKey: Map<string, { id: string; name: string; price: string; image: string | null }>
) {
  for (const item of cartItems) {
    const userId = assertFound(
      userIdByEmail.get(item.userEmail),
      `Missing user for cart item userEmail: ${item.userEmail}`
    );
    const product = assertFound(
      productByKey.get(item.productKey),
      `Missing product for cart item productKey: ${item.productKey}`
    );

    await client.query(
      `
        INSERT INTO cart_items (user_id, product_id, quantity, unit_price, product_name, product_image)
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [userId, product.id, item.quantity, product.price, product.name, product.image]
    );
  }
}

function buildSeedPassword(firstName: string, lastName: string): string {
  const normalize = (value: string) =>
    value.trim().charAt(0).toUpperCase() + value.trim().slice(1).toLowerCase();

  return `${normalize(firstName)}${normalize(lastName)}@123`;
}

async function runSeed() {
  await connectDB();
  logger.info('Seeding database...');

  const data = seedData as SeedShape;
  const passwordHash = await bcrypt.hash(
    buildSeedPassword(data.users[0].first_name, data.users[0].last_name),
    10
  );

  await withTransaction(async (client) => {
    await clearSeedTables(client);

    const userIdByEmail = await seedUsers(client, data.users, passwordHash);
    const categoryIdByKey = await seedCategories(client, data.categories);
    const productByKey = await seedProducts(client, data.products, categoryIdByKey);
    const orderIdByKey = await seedOrders(client, data.orders, userIdByEmail);

    await seedOrderItems(client, data.orderItems, orderIdByKey, productByKey);
    await seedReviews(client, data.reviews, userIdByEmail, productByKey);
    await seedCartItems(client, data.cartItems, userIdByEmail, productByKey);
  });

  logger.info('Seed complete');
  process.exit(0);
}

runSeed().catch((err) => {
  logger.error('Seed failed:', err);
  process.exit(1);
});

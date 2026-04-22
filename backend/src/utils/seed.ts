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

async function runSeed() {
  await connectDB();
  logger.info('Seeding database...');

  const data = seedData as SeedShape;
  const passwordHash = await bcrypt.hash('Password@123', 10);

  await withTransaction(async (client) => {
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

    const userIdByEmail = new Map<string, string>();
    for (const user of data.users) {
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

    const categoryIdByKey = new Map<string, string>();
    for (const category of data.categories) {
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

    const productByKey = new Map<
      string,
      { id: string; name: string; price: string; image: string | null }
    >();
    for (const product of data.products) {
      const categoryId = categoryIdByKey.get(product.categoryKey);
      if (!categoryId) {
        throw new Error(`Missing category for product key: ${product.key}`);
      }

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

    const orderIdByKey = new Map<string, string>();
    for (const order of data.orders) {
      const userId = userIdByEmail.get(order.userEmail);
      if (!userId) {
        throw new Error(`Missing user for order key: ${order.key}`);
      }

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

    for (const item of data.orderItems) {
      const orderId = orderIdByKey.get(item.orderKey);
      const product = productByKey.get(item.productKey);

      if (!orderId) {
        throw new Error(`Missing order for item orderKey: ${item.orderKey}`);
      }

      if (!product) {
        throw new Error(`Missing product for item productKey: ${item.productKey}`);
      }

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

    for (const review of data.reviews) {
      const userId = userIdByEmail.get(review.userEmail);
      const product = productByKey.get(review.productKey);

      if (!userId) {
        throw new Error(`Missing user for review userEmail: ${review.userEmail}`);
      }

      if (!product) {
        throw new Error(`Missing product for review productKey: ${review.productKey}`);
      }

      await client.query(
        `
          INSERT INTO reviews (product_id, user_id, rating, review_text)
          VALUES ($1, $2, $3, $4)
        `,
        [product.id, userId, review.rating, review.reviewText]
      );
    }

    for (const item of data.cartItems) {
      const userId = userIdByEmail.get(item.userEmail);
      const product = productByKey.get(item.productKey);

      if (!userId) {
        throw new Error(`Missing user for cart item userEmail: ${item.userEmail}`);
      }

      if (!product) {
        throw new Error(`Missing product for cart item productKey: ${item.productKey}`);
      }

      await client.query(
        `
          INSERT INTO cart_items (user_id, product_id, quantity, unit_price, product_name, product_image)
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [userId, product.id, item.quantity, product.price, product.name, product.image]
      );
    }
  });

  logger.info('Seed complete');
  process.exit(0);
}

runSeed().catch((err) => {
  logger.error('Seed failed:', err);
  process.exit(1);
});

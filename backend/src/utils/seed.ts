import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { connectDB, getPool, withTransaction } from '../config/database';
import { logger } from './logger';

type CategoryRow = {
  id: string;
  name: string;
};

type UserRow = {
  id: string;
  email: string;
  role: string;
};

type ProductRow = {
  id: string;
};

async function seed() {
  await connectDB();

  try {
    await withTransaction(async (client) => {
      // 1. Categories
      const categories = await client.query<CategoryRow>(`
        INSERT INTO categories (name, description)
        VALUES
          ('Electronics', 'Electronic devices and accessories'),
          ('Clothing', 'Clothing and fashion products'),
          ('Books', 'Books and educational materials')
        ON CONFLICT (name) DO UPDATE
        SET description = EXCLUDED.description
        RETURNING id, name;
      `);

      const categoryMap = new Map<string, string>(
        categories.rows.map((category) => [category.name, category.id])
      );

      // 2. Users
      const passwordHash = await bcrypt.hash('Password123!', 12);

      const users = await client.query<UserRow>(
        `
        INSERT INTO users (first_name, last_name, email, password_hash, role, email_verified)
        VALUES
          ('Admin', 'User', 'admin@example.com', $1, 'admin', TRUE),
          ('John', 'Doe', 'john@example.com', $1, 'user', TRUE),
          ('Jane', 'Doe', 'jane@example.com', $1, 'user', TRUE)
        ON CONFLICT (email) DO UPDATE
        SET first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            role = EXCLUDED.role,
            email_verified = EXCLUDED.email_verified
        RETURNING id, email, role;
        `,
        [passwordHash]
      );

      const userMap = new Map<string, string>(users.rows.map((user) => [user.email, user.id]));

      // 3. Products
      const products = [
        ['Laptop Pro', 'High-performance laptop', 999.99, 25, 'Electronics'],
        ['Wireless Headphones', 'Noise-cancelling headphones', 149.99, 50, 'Electronics'],
        ['Mechanical Keyboard', 'RGB mechanical keyboard', 89.99, 40, 'Electronics'],
        ['Wireless Mouse', 'Ergonomic wireless mouse', 39.99, 60, 'Electronics'],
        ['USB-C Hub', 'Multi-port USB-C hub', 49.99, 35, 'Electronics'],
        ['Smart Watch', 'Fitness and smart watch', 199.99, 30, 'Electronics'],
        ['Phone Charger', 'Fast USB-C charger', 29.99, 80, 'Electronics'],
        ['Bluetooth Speaker', 'Portable Bluetooth speaker', 79.99, 45, 'Electronics'],

        ['Cotton T-Shirt', 'Comfortable cotton t-shirt', 19.99, 100, 'Clothing'],
        ['Denim Jeans', 'Classic denim jeans', 59.99, 70, 'Clothing'],
        ['Hoodie', 'Warm casual hoodie', 44.99, 60, 'Clothing'],
        ['Running Shoes', 'Lightweight running shoes', 89.99, 50, 'Clothing'],
        ['Baseball Cap', 'Classic baseball cap', 14.99, 90, 'Clothing'],
        ['Winter Jacket', 'Insulated winter jacket', 129.99, 30, 'Clothing'],

        ['Clean Code', 'A handbook of agile software craftsmanship', 39.99, 40, 'Books'],
        ['Design Patterns', 'Reusable object-oriented software design', 49.99, 35, 'Books'],
        ['The Pragmatic Programmer', 'Guide to software craftsmanship', 44.99, 45, 'Books'],
        ['You Don’t Know JS', 'JavaScript fundamentals and concepts', 34.99, 50, 'Books'],
        ['Effective TypeScript', 'TypeScript best practices', 39.99, 40, 'Books'],
        ['Database Internals', 'Deep dive into database systems', 54.99, 25, 'Books'],
      ];

      const productIds: string[] = [];

      for (const [name, description, price, stock, categoryName] of products) {
        const result = await client.query<ProductRow>(
          `
          INSERT INTO products
            (name, description, price, stock, category_id)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id;
          `,
          [name, description, price, stock, categoryMap.get(categoryName as string)]
        );

        productIds.push(result.rows[0].id);
      }

      // 4. Orders
      const userIds = [userMap.get('john@example.com'), userMap.get('jane@example.com')];

      for (let i = 0; i < 5; i++) {
        const userId = userIds[i % userIds.length];

        await client.query(
          `
          INSERT INTO orders (user_id, status, total_amount)
          VALUES ($1, $2, $3);
          `,
          [userId, 'delivered', 100 + i * 25]
        );
      }

      // 5. Reviews
      for (let i = 0; i < 10; i++) {
        const userId = userIds[i % userIds.length];
        const productId = productIds[i];

        await client.query(
          `
          INSERT INTO reviews (user_id, product_id, rating, comment)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (user_id, product_id) DO NOTHING;
          `,
          [userId, productId, (i % 5) + 1, `Sample review ${i + 1}`]
        );
      }
    });

    logger.info('✅ Seed completed successfully');
  } catch (error) {
    logger.error('Seed failed:', error);
    process.exit(1);
  } finally {
    await getPool().end();
  }
}

void seed();

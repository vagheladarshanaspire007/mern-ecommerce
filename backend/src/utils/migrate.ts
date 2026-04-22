/**
 * ============================================================
 * Database Migrations — src/utils/migrate.ts
 * ============================================================
 * WHY migrations instead of dropping and recreating tables:
 *   Migrations track schema changes over time like Git tracks code.
 *   Team members run the same migrations in the same order →
 *   everyone has identical schemas. In production, you apply only
 *   NEW migrations — you never lose existing data.
 *
 * Run with: npm run migrate
 *
 * TODO (Day 41): Add your e-commerce tables here.
 *   Follow the pattern: CREATE TABLE IF NOT EXISTS.
 * ============================================================
 */

import 'dotenv/config';
import { connectDB, query, withTransaction } from '../config/database';
import { logger } from './logger';

const createMigrationsTableSql = `
  CREATE TABLE IF NOT EXISTS _migrations (
    id VARCHAR(255) PRIMARY KEY,
    run_at TIMESTAMP DEFAULT NOW()
  );
`;

const migrations: { id: string; sql: string }[] = [
  {
    id: '001_create_migrations_table',
    sql: createMigrationsTableSql,
  },
  {
    id: '002_create_users_table',
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        address TEXT,
        role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        reset_token VARCHAR(255),
        reset_token_expires TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        image TEXT DEFAULT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `,
  },
  {
    id: '003_create_categories_table',
    sql: `
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(120) UNIQUE NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
    `,
  },
  {
    id: '004_create_products_table',
    sql: `
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        image_urls TEXT[] DEFAULT '{}',
        price NUMERIC(10,2) NOT NULL CHECK (price > 0),
        stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
        category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        is_active BOOLEAN NOT NULL DEFAULT TRUE
      );
      CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
    `,
  },
  {
    id: '005_create_orders_table',
    sql: `
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'shipped', 'delivered', 'cancelled')),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        total_amount NUMERIC(10,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0)
      );
      CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
      CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    `,
  },
  {
    id: '006_create_order_items_table',
    sql: `
      CREATE TABLE IF NOT EXISTS order_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
        quantity INTEGER NOT NULL CHECK (quantity >= 1),
        unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
        total_price NUMERIC(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_order_items_order_product UNIQUE (order_id, product_id)
      );
      CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
      CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
    `,
  },
  {
    id: '007_create_reviews_table',
    sql: `
      CREATE TABLE IF NOT EXISTS reviews (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
        review_text TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_reviews_user_product UNIQUE (user_id, product_id)
      );
      CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
      CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
    `,
  },
  {
    id: '008_create_cart_items_table',
    sql: `
      CREATE TABLE IF NOT EXISTS cart_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity >= 1),
        is_available BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        unit_price NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
        product_name VARCHAR(255) NOT NULL,
        product_image TEXT,
        CONSTRAINT uq_cart_items_user_product UNIQUE (user_id, product_id)
      );
      CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
      CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
    `,
  },
];

async function runMigrations() {
  await connectDB();
  logger.info('Running migrations...');

  await query(createMigrationsTableSql);

  for (const migration of migrations) {
    const { rows } = await query<{ id: string }>('SELECT id FROM _migrations WHERE id = $1', [
      migration.id,
    ]);

    if (rows.length > 0) {
      logger.info(`Skipping migration: ${migration.id} (already run)`);
      continue;
    }

    await withTransaction(async (client) => {
      await client.query(migration.sql);
      await client.query('INSERT INTO _migrations (id) VALUES ($1)', [migration.id]);
    });

    logger.info(`✅ Ran migration: ${migration.id}`);
  }

  logger.info('All migrations complete');
  process.exit(0);
}

runMigrations().catch((err) => {
  logger.error('Migration failed:', err);
  process.exit(1);
});

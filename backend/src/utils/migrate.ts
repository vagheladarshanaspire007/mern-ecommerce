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

type Migration = {
  id: string;
  up: string;
  down: string;
};

const createMigrationsTableSql = `
  CREATE TABLE IF NOT EXISTS _migrations (
    id VARCHAR(255) PRIMARY KEY,
    run_at TIMESTAMP DEFAULT NOW()
  );
`;

const migrations: Migration[] = [
  {
    id: '001_create_migrations_table',
    up: createMigrationsTableSql,
    down: `
      DROP TABLE IF EXISTS _migrations;
    `,
  },
  {
    id: '002_create_users_table',
    up: `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        address VARCHAR(255),
        role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        reset_token VARCHAR(255),
        reset_token_expires TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        deleted_at TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        image TEXT DEFAULT NULL
      );
    `,
    down: `
      DROP TABLE IF EXISTS users;
    `,
  },
  {
    id: '003_create_categories_table',
    up: `
      CREATE TABLE IF NOT EXISTS categories (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        slug VARCHAR(120) UNIQUE NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
    `,
    down: `
      DROP TABLE IF EXISTS categories;
    `,
  },
  {
    id: '004_create_products_table',
    up: `
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
      -- Helps cursor pagination on the product list
      CREATE INDEX IF NOT EXISTS idx_products_created_at_id
      ON products (created_at DESC, id DESC);
      -- Helps filtering out soft-deleted/inactive products
      CREATE INDEX IF NOT EXISTS idx_products_is_active
      ON products (is_active);
    `,
    down: `
      DROP TABLE IF EXISTS products;
    `,
  },
  {
    id: '005_create_orders_table',
    up: `
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
    down: `
      DROP TABLE IF EXISTS orders;
    `,
  },
  {
    id: '006_create_order_items_table',
    up: `
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
    down: `
      DROP TABLE IF EXISTS order_items;
    `,
  },
  {
    id: '007_create_reviews_table',
    up: `
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
    down: `
      DROP TABLE IF EXISTS reviews;
    `,
  },
  {
    id: '008_create_cart_items_table',
    up: `
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
    down: `
      DROP TABLE IF EXISTS cart_items;
    `,
  },
  {
    id: '009_add_shipping_address_to_orders',
    up: `
    ALTER TABLE orders
      ADD COLUMN IF NOT EXISTS shipping_full_name VARCHAR(120),
      ADD COLUMN IF NOT EXISTS shipping_address VARCHAR(255),
      ADD COLUMN IF NOT EXISTS shipping_city VARCHAR(80),
      ADD COLUMN IF NOT EXISTS shipping_state VARCHAR(80),
      ADD COLUMN IF NOT EXISTS shipping_pin VARCHAR(20),
      ADD COLUMN IF NOT EXISTS shipping_phone VARCHAR(20);
  `,
    down: `
    ALTER TABLE orders
      DROP COLUMN IF EXISTS shipping_phone,
      DROP COLUMN IF EXISTS shipping_pin,
      DROP COLUMN IF EXISTS shipping_state,
      DROP COLUMN IF EXISTS shipping_city,
      DROP COLUMN IF EXISTS shipping_address,
      DROP COLUMN IF EXISTS shipping_full_name;
  `,
  },
];

async function migrateUp() {
  await connectDB();
  logger.info('Running up migrations...');

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
      await client.query(migration.up);
      await client.query('INSERT INTO _migrations (id) VALUES ($1)', [migration.id]);
    });

    logger.info(`Ran migration: ${migration.id}`);
  }

  logger.info('Up migrations complete');
}

async function migrateDown(steps: number) {
  await connectDB();
  logger.info(`Running down migrations for ${steps} step(s)...`);

  await query(createMigrationsTableSql);

  const { rows } = await query<{ id: string }>(
    `
      SELECT id
      FROM _migrations
      ORDER BY run_at DESC, id DESC
      LIMIT $1
    `,
    [steps]
  );

  if (rows.length === 0) {
    logger.info('No migrations to rollback');
    return;
  }

  for (const row of rows) {
    const migration = migrations.find((m) => m.id === row.id);

    if (!migration) {
      logger.warn(`Migration definition not found for id=${row.id}; skipping`);
      continue;
    }

    await withTransaction(async (client) => {
      await client.query('DELETE FROM _migrations WHERE id = $1', [migration.id]);
      await client.query(migration.down);
    });

    logger.info(`Rolled back migration: ${migration.id}`);
  }

  logger.info('Down migrations complete');
}

function parseSteps(raw: string | undefined): number {
  if (!raw) return 1;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error('Steps must be a positive integer');
  }
  return parsed;
}

async function main() {
  const command = (process.argv[2] ?? 'up').toLowerCase();

  if (command === 'up') {
    await migrateUp();
    return;
  }

  if (command === 'down') {
    const steps = parseSteps(process.argv[3]);
    await migrateDown(steps);
    return;
  }

  throw new Error(`Unknown command "${command}". Use "up" or "down".`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error('Migration failed:', err);
    process.exit(1);
  });

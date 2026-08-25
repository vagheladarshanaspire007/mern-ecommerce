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
        role VARCHAR(20) NOT NULL DEFAULT 'user',
        email_verified BOOLEAN DEFAULT FALSE,
        reset_token VARCHAR(255),
        reset_token_expires TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `,
  },
  {
    id: '003_create_products_table',
    sql: `
      -- TODO (Day 41): Define your products schema
      -- Suggested fields: id, name, description, price, stock, category_id, images[], created_at
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price NUMERIC(10, 2) NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        image_urls TEXT[] DEFAULT '{}',
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
      CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock);
    `,
  },

  {
    id: '004_create_categories_table',
    sql: `
    CREATE TABLE IF NOT EXISTS categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) NOT NULL UNIQUE,
      description TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `,
  },
  {
  id: '005_add_category_to_products',
  sql: `
    ALTER TABLE products
    ADD COLUMN IF NOT EXISTS category_id UUID;

    ALTER TABLE products
    ADD CONSTRAINT fk_products_category
    FOREIGN KEY (category_id)
    REFERENCES categories(id)
    ON DELETE RESTRICT;

    CREATE INDEX IF NOT EXISTS idx_products_category_id
    ON products(category_id);
  `,
},
{
  id: '006_create_orders_table',
  sql: `
    CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
      total_amount NUMERIC(10, 2) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),

      CONSTRAINT fk_orders_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE RESTRICT
    );

    CREATE INDEX IF NOT EXISTS idx_orders_user_id
      ON orders(user_id);

    CREATE INDEX IF NOT EXISTS idx_orders_status
      ON orders(status);
  `,
},
{
  id: '007_create_order_items_table',
  sql: `
    CREATE TABLE IF NOT EXISTS order_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id UUID NOT NULL,
      product_id UUID NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      unit_price NUMERIC(10, 2) NOT NULL,

      CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id)
        REFERENCES orders(id)
        ON DELETE CASCADE,

      CONSTRAINT fk_order_items_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE RESTRICT
    );

    CREATE INDEX IF NOT EXISTS idx_order_items_order_id
      ON order_items(order_id);

    CREATE INDEX IF NOT EXISTS idx_order_items_product_id
      ON order_items(product_id);
  `,
},
{
  id: '008_create_reviews_table',
  sql: `
    CREATE TABLE IF NOT EXISTS reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      product_id UUID NOT NULL,
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),

      CONSTRAINT fk_reviews_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

      CONSTRAINT fk_reviews_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,

      CONSTRAINT uq_reviews_user_product
        UNIQUE (user_id, product_id)
    );

    CREATE INDEX IF NOT EXISTS idx_reviews_product_id
      ON reviews(product_id);
  `,
},
{
  id: '009_create_cart_items_table',
  sql: `
    CREATE TABLE IF NOT EXISTS cart_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL,
      product_id UUID NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),

      CONSTRAINT fk_cart_items_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

      CONSTRAINT fk_cart_items_product
        FOREIGN KEY (product_id)
        REFERENCES products(id)
        ON DELETE CASCADE,

      CONSTRAINT uq_cart_items_user_product
        UNIQUE (user_id, product_id)
    );

    CREATE INDEX IF NOT EXISTS idx_cart_items_user_id
      ON cart_items(user_id);

    CREATE INDEX IF NOT EXISTS idx_cart_items_product_id
      ON cart_items(product_id);
  `,
},

  // TODO (Day 41): Add more tables: categories, orders, order_items, reviews, cart
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

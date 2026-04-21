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

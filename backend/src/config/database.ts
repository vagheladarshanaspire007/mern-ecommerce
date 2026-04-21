/**
 * ============================================================
 * PostgreSQL Configuration — src/config/database.ts
 * ============================================================
 * WHY pg Pool (not Client):
 *   A Pool manages multiple reusable database connections.
 *   Creating a new Client for every request is expensive.
 *   The pool keeps connections alive and hands them out on demand.
 *
 * WHY connection limits:
 *   PostgreSQL has a max_connections setting (default: 100).
 *   If every Node process opens 10 connections and you run
 *   8 processes, that's 80 connections — leaving room for
 *   admin queries. Tune min/max based on your Postgres config.
 * ============================================================
 */

import { Pool, PoolClient, QueryResult } from 'pg';
import { logger } from '../utils/logger';

let pool: Pool;

export const connectDB = async (): Promise<void> => {
  pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'mern_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD,
    min: parseInt(process.env.DB_POOL_MIN || '2'),   // Minimum idle connections
    max: parseInt(process.env.DB_POOL_MAX || '10'),  // Maximum connections
    idleTimeoutMillis: 30_000,    // Close idle connections after 30s
    connectionTimeoutMillis: 5_000, // Error if connection takes >5s
    statement_timeout: 30_000,    // Kill queries running >30s (prevent runaway queries)
  });

  // Test the connection
  const client = await pool.connect();
  await client.query('SELECT 1');
  client.release();
};

export const getPool = (): Pool => {
  if (!pool) throw new Error('Database not initialized. Call connectDB() first.');
  return pool;
};

/**
 * Execute a query safely with parameterized values.
 *
 * WHY parameterized queries:
 *   Prevents SQL injection. Values are sent separately from the SQL
 *   and the database driver handles escaping. NEVER concatenate
 *   user input directly into SQL strings.
 *
 * @example
 *   await query('SELECT * FROM users WHERE id = $1', [userId])
 */
export const query = async <T = Record<string, unknown>>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> => {
  const start = Date.now();
  const result = await getPool().query<T>(text, params);
  const duration = Date.now() - start;

  // Log slow queries (>1000ms) as warnings for optimization
  if (duration > 1000) {
    logger.warn('Slow query detected', { text, duration, rows: result.rowCount });
  }

  return result;
};

/**
 * Transaction helper — wraps multiple queries in a single transaction.
 *
 * WHY transactions:
 *   ACID compliance — if any query in the block fails, ALL are rolled back.
 *   Essential for operations like: deduct inventory AND create order.
 *   Without transactions, a crash between the two queries leaves corrupted data.
 *
 * @example
 *   await withTransaction(async (client) => {
 *     await client.query('UPDATE inventory ...');
 *     await client.query('INSERT INTO orders ...');
 *   });
 */
export const withTransaction = async <T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> => {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release(); // Always release back to pool
  }
};

import { connectDB, getPool, withTransaction, query } from '../../config/database';

const TEST_TRUNCATE_SQL = `
  TRUNCATE TABLE
    cart_items,
    reviews,
    order_items,
    orders,
    products,
    categories,
    users
  RESTART IDENTITY CASCADE;
`;

export async function initializeTestDatabase(): Promise<void> {
  await connectDB();
}

export async function seedBaselineData(
  seedFn: (client: import('pg').PoolClient) => Promise<void>
): Promise<void> {
  await withTransaction(async (client) => {
    await client.query(TEST_TRUNCATE_SQL);
    await seedFn(client);
  });
}

export async function rollbackToCleanState(): Promise<void> {
  await getPool().query(TEST_TRUNCATE_SQL);
}

export async function truncateAllTables(): Promise<void> {
  await query(TEST_TRUNCATE_SQL);
}

export async function closeTestDatabase(): Promise<void> {
  const pool = getPool();
  await pool.end();
}

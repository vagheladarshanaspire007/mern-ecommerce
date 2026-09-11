import 'dotenv/config';
import { connectDB, getPool } from '../config/database';
import { connectRedis, getRedis } from '../config/redis';

if (process.env.NODE_ENV !== 'test') {
  throw new Error(
    `Tests must run with NODE_ENV=test. Current value: ${process.env.NODE_ENV ?? 'undefined'}`
  );
}

jest.mock('uuid', () => ({
  v4: jest.fn(() => '00000000-0000-0000-0000-000000000001'),
}));

beforeAll(async () => {
  await connectDB();
  await connectRedis();
});

afterAll(async () => {
  await getPool().end();
  await getRedis().quit();
});

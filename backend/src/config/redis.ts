/**
 * ============================================================
 * Redis Configuration — src/config/redis.ts
 * ============================================================
 * WHY Redis:
 *   1. Caching      — Store expensive DB query results (product lists, etc.)
 *   2. Sessions     — Store refresh tokens (easy revocation)
 *   3. Rate Limiting — Count requests per IP across multiple instances
 *   4. Job Queues   — Bull uses Redis as its queue backend
 *   5. Pub/Sub      — Socket.io Redis adapter for horizontal scaling
 *
 * WHY ioredis over the 'redis' package:
 *   ioredis has better TypeScript support, automatic reconnection,
 *   cluster support, and Lua scripting support.
 * ============================================================
 */

import Redis from 'ioredis';
import { logger } from '../utils/logger';

let redisClient: Redis;

export const connectRedis = async (): Promise<void> => {
  redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: 3,
    retryStrategy: (times: number) => {
      // Exponential backoff: wait 2^times * 100ms between retries
      // WHY: Prevents hammering Redis during a brief outage
      const delay = Math.min(times * 100, 2000);
      logger.warn(`Redis retry attempt ${times}, waiting ${delay}ms`);
      return delay;
    },
    lazyConnect: false,
  });

  // Test connection
  await redisClient.ping();

  redisClient.on('error', (err) => logger.error('Redis error:', err));
  redisClient.on('reconnecting', () => logger.warn('Redis reconnecting...'));
};

export const getRedis = (): Redis => {
  if (!redisClient) throw new Error('Redis not initialized. Call connectRedis() first.');
  return redisClient;
};

// ─── Cache Helpers ──────────────────────────────────────────

const DEFAULT_TTL = parseInt(process.env.REDIS_TTL || '3600');

/**
 * Get parsed JSON from cache.
 * Returns null on cache miss — caller decides what to do.
 */
export const cacheGet = async <T>(key: string): Promise<T | null> => {
  const data = await getRedis().get(key);
  if (!data) return null;
  try {
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
};

/**
 * Set JSON value in cache with optional TTL.
 *
 * WHY JSON.stringify:
 *   Redis stores strings only. We serialize objects to JSON
 *   and deserialize on read. Be aware: Date objects become strings.
 */
export const cacheSet = async (
  key: string,
  value: unknown,
  ttl: number = DEFAULT_TTL
): Promise<void> => {
  await getRedis().setex(key, ttl, JSON.stringify(value));
};

/** Delete a cache key — call this when underlying data changes (cache invalidation) */
export const cacheDel = async (key: string): Promise<void> => {
  await getRedis().del(key);
};

/**
 * Delete all keys matching a pattern.
 *
 * WHY: When a product is updated, invalidate ALL product cache keys
 *      (e.g., 'products:page:1', 'products:page:2', 'products:search:*').
 *
 * WARNING: SCAN is used instead of KEYS to avoid blocking Redis.
 *          KEYS blocks while scanning — dangerous on large datasets.
 */
export const cacheInvalidatePattern = async (pattern: string): Promise<void> => {
  const stream = getRedis().scanStream({ match: pattern, count: 100 });
  const pipeline = getRedis().pipeline();

  stream.on('data', (keys: string[]) => {
    keys.forEach((key) => pipeline.del(key));
  });

  await new Promise<void>((resolve, reject) => {
    stream.on('end', () => resolve());
    stream.on('error', reject);
  });

  await pipeline.exec();
};

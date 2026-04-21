/**
 * Health Check Route — src/routes/health.routes.ts
 *
 * WHY a health endpoint:
 *   Load balancers (Nginx, AWS ALB) and orchestrators (Kubernetes)
 *   periodically ping /health to check if the instance is alive.
 *   If it returns non-2xx, traffic is routed away from that instance.
 *
 * Two levels:
 *   /api/health         → Liveness:  "Is the process running?"
 *   /api/health/ready   → Readiness: "Is it ready to serve traffic?"
 *                          (checks DB and Redis connectivity)
 */
import { Router, Request, Response } from 'express';
import { getPool } from '../config/database';
import { getRedis } from '../config/redis';
import { logger } from '../utils/logger';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
});

router.get('/ready', async (_req: Request, res: Response) => {
  const checks: Record<string, 'ok' | 'error'> = {};

  // Check PostgreSQL
  try {
    await getPool().query('SELECT 1');
    checks.database = 'ok';
  } catch (err) {
    checks.database = 'error';
    logger.error('Health check: DB failed', err);
  }

  // Check Redis
  try {
    await getRedis().ping();
    checks.redis = 'ok';
  } catch (err) {
    checks.redis = 'error';
    logger.error('Health check: Redis failed', err);
  }

  const allHealthy = Object.values(checks).every((v) => v === 'ok');
  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'ok' : 'degraded',
    checks,
    timestamp: new Date().toISOString(),
  });
});

export { router as healthRouter };

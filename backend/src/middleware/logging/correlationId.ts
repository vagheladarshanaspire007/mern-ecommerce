/**
 * Correlation ID Middleware — src/middleware/logging/correlationId.ts
 *
 * WHY: In distributed systems, a single user action might trigger
 * requests to multiple services. A correlation ID ties all those
 * log entries together so you can trace the full journey.
 *
 * Flow:
 *   Client sends X-Correlation-ID header (optional)
 *   → If present, use it (allows frontend to trace requests)
 *   → If absent, generate a new UUID
 *   → Attach to req and res headers so it appears in all logs
 */
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

export const correlationId = (req: Request, res: Response, next: NextFunction): void => {
  const id = (req.headers['x-correlation-id'] as string) || uuidv4();
  req.headers['x-correlation-id'] = id;
  res.setHeader('X-Correlation-ID', id);
  next();
};

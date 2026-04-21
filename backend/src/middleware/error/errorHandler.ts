/**
 * ============================================================
 * Global Error Handler — src/middleware/error/errorHandler.ts
 * ============================================================
 * WHY a centralized error handler:
 *   - Consistent error response format across ALL endpoints
 *   - Single place to log errors (prevents scattered logger calls)
 *   - Hide stack traces in production (security)
 *   - Map different error types to correct HTTP status codes
 *
 * HOW it works:
 *   Because we use `express-async-errors`, any `throw` in an
 *   async route handler is automatically forwarded here.
 *   Without that package, you'd need try/catch + next(error) everywhere.
 * ============================================================
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../../utils/AppError';
import { logger } from '../../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  // Attach correlation ID for log tracing
  const correlationId = req.headers['x-correlation-id'] as string;

  // ── 1. Operational Errors (AppError) ─────────────────────
  // These are expected errors we threw intentionally (e.g., "User not found")
  if (err instanceof AppError) {
    logger.warn('Operational error', {
      correlationId,
      statusCode: err.statusCode,
      message: err.message,
      url: req.url,
      method: req.method,
    });

    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details !== undefined ? { details: err.details } : {}),
      },
    });
    return;
  }

  // ── 2. Zod Validation Errors ─────────────────────────────
  // WHY separate: Zod errors have a rich structure we want to expose to the client
  if (err instanceof ZodError) {
    logger.warn('Validation error', { correlationId, errors: err.errors });
    res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
    });
    return;
  }

  // ── 3. JWT Errors ────────────────────────────────────────
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      error: {
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token',
      },
    });
    return;
  }

  // ── 4. Postgres Unique Violation ─────────────────────────
  if ((err as NodeJS.ErrnoException).code === '23505') {
    res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_ENTRY',
        message: 'A record with this value already exists',
      },
    });
    return;
  }

  // ── 5. Multer File Size Error ────────────────────────────
  if (err.name === 'MulterError' && (err as { code?: string }).code === 'LIMIT_FILE_SIZE') {
    res.status(413).json({
      success: false,
      error: {
        code: 'FILE_TOO_LARGE',
        message: `File size exceeds the limit of ${process.env.UPLOAD_MAX_SIZE_MB}MB`,
      },
    });
    return;
  }

  // ── 6. Unknown / Programming Errors ─────────────────────
  // These are bugs we did NOT anticipate. Log the full stack trace.
  // WHY hide details in production: Stack traces reveal file structure,
  // library versions, and logic — useful for attackers.
  logger.error('Unhandled error', {
    correlationId,
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
  });

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message:
        process.env.NODE_ENV === 'production'
          ? 'Something went wrong. Please try again later.'
          : err.message,
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  });
};

/**
 * ============================================================
 * AppError — src/utils/AppError.ts
 * ============================================================
 * WHY a custom error class:
 *   JavaScript's built-in Error only has `message` and `stack`.
 *   We need `statusCode` (HTTP code) and `code` (machine-readable)
 *   so the error handler can respond correctly without needing
 *   a bunch of if/else statements.
 *
 * Usage:
 *   throw new AppError(404, 'USER_NOT_FOUND', 'User does not exist');
 *   throw new AppError(400, 'INVALID_INPUT', 'Email is required', { field: 'email' });
 * ============================================================
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    // Operational = expected error (user's fault, not ours)
    // Non-operational = programming error (our fault) → alert DevOps
    this.isOperational = true;

    // Maintains proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── Common Pre-built Errors ─────────────────────────────────
export const Errors = {
  NotFound: (resource = 'Resource') =>
    new AppError(404, 'NOT_FOUND', `${resource} not found`),

  Unauthorized: (message = 'Authentication required') =>
    new AppError(401, 'UNAUTHORIZED', message),

  Forbidden: (message = 'Access denied') =>
    new AppError(403, 'FORBIDDEN', message),

  BadRequest: (message: string, details?: unknown) =>
    new AppError(400, 'BAD_REQUEST', message, details),

  Conflict: (message: string) =>
    new AppError(409, 'CONFLICT', message),

  TooManyRequests: () =>
    new AppError(429, 'RATE_LIMIT_EXCEEDED', 'Too many requests'),

  InternalError: (message = 'Internal server error') =>
    new AppError(500, 'INTERNAL_ERROR', message),
} as const;

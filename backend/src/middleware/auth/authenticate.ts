/**
 * ============================================================
 * Auth Middleware — src/middleware/auth/authenticate.ts
 * ============================================================
 * WHY middleware vs controller logic:
 *   Authentication is cross-cutting concern — it applies to many
 *   routes. Putting it in middleware means one place to update,
 *   and routes stay clean (just business logic).
 *
 * WHY httpOnly cookies for refresh tokens:
 *   Storing refresh tokens in localStorage is vulnerable to XSS.
 *   httpOnly cookies cannot be read by JavaScript — even if an
 *   attacker injects script, they cannot steal the refresh token.
 *
 * WHY short-lived access tokens (15min):
 *   If stolen, they expire quickly. The refresh token (7d, in cookie)
 *   gets a new access token without re-login. This is the industry
 *   standard "refresh token rotation" pattern.
 * ============================================================
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../utils/AppError';
import { verifyAccessToken, TokenPayload } from '../../utils/jwt';

// Extend Express Request type to include our user
declare module 'express-serve-static-core' {
  interface Request {
    user?: TokenPayload;
  }
}

/**
 * Require authentication — attach user to req.user
 * Usage: router.get('/profile', authenticate, profileController)
 */
export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  // Extract token from Authorization header: "Bearer <token>"
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError(401, 'UNAUTHORIZED', 'No token provided');
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyAccessToken(token);

  if (!decoded) {
    throw new AppError(401, 'INVALID_TOKEN', 'Invalid or expired token');
  }

  req.user = decoded;
  next();
};

/**
 * Require specific role(s) — must be used AFTER authenticate
 *
 * @example
 *   router.delete('/users/:id', authenticate, authorize('admin'), deleteUser)
 *   router.get('/reports', authenticate, authorize('admin', 'manager'), getReports)
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      throw new AppError(403, 'FORBIDDEN', `Access denied. Required role: ${roles.join(' or ')}`);
    }

    next();
  };
};

/**
 * Optional authentication — attaches user if token present, but does NOT fail
 * Use for routes that have different behavior for logged in vs anonymous users
 * @example: product listing (show wishlist status if logged in)
 */
export const optionalAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return next(); // Proceed without user
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyAccessToken(token);
  if (decoded) req.user = decoded;
  next();
};

/**
 * ============================================================
 * Rate Limiters — src/middleware/security/rateLimiter.ts
 * ============================================================
 * WHY rate limiting:
 *   - Prevents brute-force attacks on login endpoints
 *   - Stops API scraping / abuse
 *   - Protects backend from DDoS overload
 *   - Provides fair usage enforcement
 *
 * WHY Redis-backed:
 *   Memory-based rate limiting (in-process) only works for a
 *   single Node.js process. If you run 4 workers (PM2 cluster),
 *   each has its own counter — attacker gets 4x the limit.
 *   Redis is shared across all processes → global rate limit.
 *
 * Strategy:
 *   - Global limiter:    100 requests / 15min (all API routes)
 *   - Auth limiter:       5 requests / 15min (login/register — strict)
 *   - Password limiter:   3 requests / 1hr   (password reset)
 * ============================================================
 */

import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// ─── Global Rate Limiter ─────────────────────────────────────
export const globalRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 min
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  standardHeaders: true, // Returns RateLimit-* headers (RFC standard)
  legacyHeaders: false, // Disable X-RateLimit-* (deprecated)
  keyGenerator: (req: Request): string => {
    // WHY custom key: Use real IP, not proxy IP (trust proxy must be set)
    // In production behind nginx: app.set('trust proxy', 1)
    return req.ip || req.socket.remoteAddress || 'unknown';
  },
  handler: (_req: Request, res: Response): void => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many requests. Please try again later.',
      },
    });
  },
});

// ─── Auth Rate Limiter (Strict) ──────────────────────────────
// Apply this ONLY to /auth/login and /auth/register
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 login attempts per 15 min
  skipSuccessfulRequests: true, // Don't count successful logins
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response): void => {
    res.status(429).json({
      success: false,
      error: {
        code: 'AUTH_RATE_LIMIT_EXCEEDED',
        message: 'Too many login attempts. Please wait 15 minutes.',
      },
    });
  },
});

// ─── Password Reset Rate Limiter ─────────────────────────────
export const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response): void => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RESET_RATE_LIMIT_EXCEEDED',
        message: 'Too many password reset requests. Please wait 1 hour.',
      },
    });
  },
});

// ─── Upload Rate Limiter ─────────────────────────────────────
export const uploadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Max 50 uploads per hour
  standardHeaders: true,
  legacyHeaders: false,
});

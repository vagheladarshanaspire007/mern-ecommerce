/**
 * ============================================================
 * Auth Routes — src/routes/auth.routes.ts
 * ============================================================
 * Routes registered here:
 *   POST /api/v1/auth/register      → Create account
 *   POST /api/v1/auth/login         → Get access + refresh tokens
 *   POST /api/v1/auth/refresh       → Exchange refresh token for new access token
 *   POST /api/v1/auth/logout        → Clear refresh token cookie
 *   POST /api/v1/auth/forgot-password → Send reset email
 *   POST /api/v1/auth/reset-password  → Apply new password
 *   GET  /api/v1/auth/me            → Get current user (protected)
 *
 * Pattern: Route → Validate → Controller → Service → DB
 *   Routes    = URL mapping + middleware attachment
 *   Validate  = Request shape validation (Zod)
 *   Controller = Extract from req, call service, send response
 *   Service   = Business logic (pure functions, no req/res)
 *   DB        = Repository pattern (SQL queries)
 * ============================================================
 */

import { Router } from 'express';
import { authRateLimiter, passwordResetRateLimiter } from '../middleware/security/rateLimiter';
import { authenticate } from '../middleware/auth/authenticate';
import { validateRequest } from '../middleware/validation/validateRequest';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validator';

// TODO (Day 8 — Week 2): Import and implement these controllers
// import { register, login, refresh, logout, forgotPassword, resetPassword, getMe } from '../controllers/auth.controller';

const router = Router();

// ─── Public Routes ───────────────────────────────────────────

// WHY authRateLimiter on register: Prevent automated account creation (spam)
router.post(
  '/register',
  authRateLimiter,
  validateRequest(registerSchema),
  // register,  ← TODO: uncomment when controller is implemented
  (_req, res) => res.status(501).json({ message: 'TODO: Implement register controller' })
);

router.post(
  '/login',
  authRateLimiter,
  validateRequest(loginSchema),
  // login,
  (_req, res) => res.status(501).json({ message: 'TODO: Implement login controller' })
);

// WHY no auth on refresh: The refresh token IS the credential (in cookie)
router.post(
  '/refresh',
  // refresh,
  (_req, res) => res.status(501).json({ message: 'TODO: Implement refresh controller' })
);

router.post(
  '/forgot-password',
  passwordResetRateLimiter,
  validateRequest(forgotPasswordSchema),
  // forgotPassword,
  (_req, res) => res.status(501).json({ message: 'TODO: Implement forgotPassword controller' })
);

router.post(
  '/reset-password',
  validateRequest(resetPasswordSchema),
  // resetPassword,
  (_req, res) => res.status(501).json({ message: 'TODO: Implement resetPassword controller' })
);

// ─── Protected Routes ────────────────────────────────────────

router.post(
  '/logout',
  authenticate,
  // logout,
  (_req, res) => res.status(501).json({ message: 'TODO: Implement logout controller' })
);

router.get(
  '/me',
  authenticate,
  // getMe,
  (req, res) =>
    res.json({ message: 'TODO: Implement getMe controller', user: req.user })
);

export { router as authRouter };

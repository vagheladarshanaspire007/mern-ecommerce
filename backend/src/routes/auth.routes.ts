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
import {
  registerController,
  loginController,
  refreshController,
  logoutController,
  forgotPasswordController,
  resetPasswordController,
  meController,
} from '../controllers/auth.controller';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Public
router.post(
  '/register',
  authRateLimiter,
  validateRequest(registerSchema),
  asyncHandler(registerController)
);

router.post('/login', authRateLimiter, validateRequest(loginSchema), asyncHandler(loginController));

router.post('/refresh', asyncHandler(refreshController));

router.post(
  '/forgot-password',
  passwordResetRateLimiter,
  validateRequest(forgotPasswordSchema),
  asyncHandler(forgotPasswordController)
);

router.post(
  '/reset-password',
  validateRequest(resetPasswordSchema),
  asyncHandler(resetPasswordController)
);

router.post('/logout', asyncHandler(logoutController));
// Protected
router.get('/me', authenticate, asyncHandler(meController));

export { router as authRouter };

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
import {
  loginRateLimiter,
  passwordResetRateLimiter,
  registerRateLimiter,
} from '../middleware/security/rateLimiter';
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
import { ROUTES } from '../constants/routes';

const router = Router();

// Public
router.post(
  ROUTES.AUTH.REGISTER,
  registerRateLimiter,
  validateRequest(registerSchema),
  asyncHandler(registerController)
);

router.post(
  ROUTES.AUTH.LOGIN,
  loginRateLimiter,
  validateRequest(loginSchema),
  asyncHandler(loginController)
);

router.post(ROUTES.AUTH.REFRESH, asyncHandler(refreshController));

router.post(
  ROUTES.AUTH.FORGOT_PASSWORD,
  passwordResetRateLimiter,
  validateRequest(forgotPasswordSchema),
  asyncHandler(forgotPasswordController)
);

router.post(
  ROUTES.AUTH.RESET_PASSWORD,
  validateRequest(resetPasswordSchema),
  asyncHandler(resetPasswordController)
);

router.post(ROUTES.AUTH.LOGOUT, asyncHandler(logoutController));
// Protected
router.get(ROUTES.AUTH.ME, authenticate, asyncHandler(meController));

export { router as authRouter };

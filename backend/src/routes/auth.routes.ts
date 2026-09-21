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
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
} from '../controllers/auth.controller';

const router = Router();

router.post('/register', authRateLimiter, validateRequest(registerSchema), (req, res, next) => {
  void register(req, res).catch(next);
});

router.post('/login', authRateLimiter, validateRequest(loginSchema), (req, res, next) => {
  void login(req, res).catch(next);
});

router.post('/refresh', (req, res, next) => {
  void refresh(req, res).catch(next);
});

router.post(
  '/forgot-password',
  passwordResetRateLimiter,
  validateRequest(forgotPasswordSchema),
  (req, res, next) => {
    void forgotPassword(req, res).catch(next);
  }
);

router.post('/reset-password', validateRequest(resetPasswordSchema), (req, res, next) => {
  void resetPassword(req, res).catch(next);
});

router.post('/logout', authenticate, (req, res, next) => {
  void logout(req, res).catch(next);
});

router.get('/me', authenticate, (req, res, next) => {
  void getMe(req, res).catch(next);
});

export { router as authRouter };

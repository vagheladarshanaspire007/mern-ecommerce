/**
 * ============================================================
 * Auth Validators — src/validators/auth.validator.ts
 * ============================================================
 * WHY Zod schemas here and not inline in routes:
 *   - Reusable across routes and tests
 *   - TypeScript types auto-inferred (no duplication)
 *   - Single source of truth for validation rules
 *
 * WHY strict password requirements:
 *   - Min 8 chars: brute-force protection
 *   - Uppercase + lowercase + number: increases entropy
 *   - These rules align with NIST SP 800-63B guidelines
 *
 * WHY .trim() on strings:
 *   Users sometimes accidentally add spaces. Trimming prevents
 *   "user@email.com " being a different user than "user@email.com"
 * ============================================================
 */

import { z } from 'zod';

// ─── Reusable Field Schemas ──────────────────────────────────
const emailField = z.string().trim().email('Invalid email address').toLowerCase();

const passwordField = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password is too long')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

// ─── Auth Schemas ────────────────────────────────────────────

export const registerSchema = z
  .object({
    firstName: z.string().trim().min(1, 'First name is required').max(50),
    lastName: z.string().trim().min(1, 'Last name is required').max(50),
    email: emailField,
    password: passwordField,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

export const forgotPasswordSchema = z.object({
  email: emailField,
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Reset token is required'),
    password: passwordField,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// ─── Inferred Types ──────────────────────────────────────────
// WHY: Use these in controllers for type-safe req.body access
export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type ForgotPasswordDto = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordDto = z.infer<typeof resetPasswordSchema>;

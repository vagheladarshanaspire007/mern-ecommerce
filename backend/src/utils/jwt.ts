/**
 * ============================================================
 * JWT Utilities — src/utils/jwt.ts
 * ============================================================
 * WHY two tokens (access + refresh):
 *   Access token: Short-lived (15min), sent with every API request.
 *   Refresh token: Long-lived (7d), stored in httpOnly cookie,
 *                  used ONLY to get a new access token.
 *
 * WHY separate secrets for access and refresh:
 *   If the access secret is compromised, attacker can't forge
 *   refresh tokens (and vice versa). Defense in depth.
 *
 * WHY not store tokens in the database:
 *   JWTs are stateless — the token itself contains all needed info.
 *   However: to support logout/revocation, store a token version/jti
 *   in Redis and check it on each request (see refresh rotation below).
 * ============================================================
 */

import jwt, { SignOptions } from 'jsonwebtoken';
import { logger } from './logger';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_EXPIRES_IN = (process.env.JWT_ACCESS_EXPIRES_IN || '15m') as SignOptions['expiresIn'];
const REFRESH_EXPIRES_IN = (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as SignOptions['expiresIn'];

if (!ACCESS_SECRET || !REFRESH_SECRET) {
  throw new Error('JWT secrets must be defined in environment variables');
}

/**
 * Generate a short-lived access token.
 * Include ONLY non-sensitive, frequently-needed data.
 * WHY not include password hash, full profile, etc.:
 *   Token is sent with every request — keep it small.
 *   Also: sensitive data in token is base64 encoded (NOT encrypted).
 */
export const generateAccessToken = (payload: Omit<TokenPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, ACCESS_SECRET, {
    expiresIn: ACCESS_EXPIRES_IN,
    algorithm: 'HS256',
  });
};

/** Generate a long-lived refresh token stored in httpOnly cookie */
export const generateRefreshToken = (payload: Omit<TokenPayload, 'iat' | 'exp'>): string => {
  return jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
    algorithm: 'HS256',
  });
};

/** Verify and decode access token — returns null on failure (don't throw) */
export const verifyAccessToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      logger.debug('Access token verification failed:', (error as Error).message);
    }
    return null;
  }
};

/** Verify and decode refresh token */
export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
  } catch {
    return null;
  }
};

/** Cookie options for the refresh token httpOnly cookie */
export const refreshCookieOptions = {
  httpOnly: true, // Not accessible via JavaScript
  secure: process.env.NODE_ENV === 'production', // HTTPS only in prod
  sameSite: 'strict' as const, // Prevent CSRF
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  path: '/api/v1/auth/refresh', // Restrict cookie scope
};

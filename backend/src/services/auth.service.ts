import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { AppError } from '../utils/AppError';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  TokenPayload,
} from '../utils/jwt';
import { getRedis } from '../config/redis';
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserPassword,
  toPublicUser,
  PublicUser,
  UserRow,
} from '../models/user.model';

const BCRYPT_ROUNDS = 12;
const RESET_TOKEN_TTL_SECONDS = 60 * 60; // 1 hour
const DEFAULT_REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days
const RESET_TOKEN_PREFIX = 'auth:reset:';
const REFRESH_TOKEN_PREFIX = 'auth:refresh:';

// Precompute one valid bcrypt hash so login can still do a bcrypt compare
// without accidentally leaking whether the email exists.
const DUMMY_PASSWORD_HASH = bcrypt.hashSync('__auth_dummy_password__', BCRYPT_ROUNDS);

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

type AuthResult = {
  user: PublicUser;
  accessToken: string;
  refreshToken: string;
};

type RegisterInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

type ForgotPasswordInput = {
  email: string;
};

type ResetPasswordInput = {
  token: string;
  password: string;
};

const resetKey = (token: string) => `${RESET_TOKEN_PREFIX}${token}`;
const refreshKeyForUser = (userId: string) => `${REFRESH_TOKEN_PREFIX}${userId}`;

const buildTokens = (user: Pick<UserRow, 'id' | 'email' | 'role'>): AuthTokens => {
  const payload: Omit<TokenPayload, 'iat' | 'exp'> = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

const storeRefreshToken = async (userId: string, refreshToken: string): Promise<void> => {
  await getRedis().setex(
    String(refreshKeyForUser(userId)),
    DEFAULT_REFRESH_TTL_SECONDS,
    refreshToken
  );
};

const verifyStoredRefreshToken = async (
  payload: TokenPayload,
  refreshToken: string
): Promise<void> => {
  const storedToken = await getRedis().get(String(refreshKeyForUser(payload.userId)));

  if (!storedToken || storedToken !== refreshToken) {
    throw new AppError(401, 'INVALID_TOKEN', 'Invalid or expired token');
  }
};

export const register = async (input: RegisterInput): Promise<AuthResult> => {
  const existingUser = await findUserByEmail(input.email);
  if (existingUser) {
    throw new AppError(409, 'CONFLICT', 'Email already exists');
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  const createdUser = await createUser({
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    passwordHash,
  });

  const tokens = buildTokens({
    id: createdUser.id,
    email: createdUser.email,
    role: createdUser.role,
  });

  await storeRefreshToken(createdUser.id, tokens.refreshToken);

  return {
    user: createdUser,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
};

export const login = async (input: LoginInput): Promise<AuthResult> => {
  const user = await findUserByEmail(input.email);

  const passwordMatches = await bcrypt.compare(
    input.password,
    user?.password_hash ?? DUMMY_PASSWORD_HASH
  );

  if (!user || !passwordMatches) {
    throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
  }

  const tokens = buildTokens(user);
  await storeRefreshToken(user.id, tokens.refreshToken);

  return {
    user: toPublicUser(user),
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
};

export const refresh = async (refreshToken: string): Promise<{ accessToken: string }> => {
  const payload = verifyRefreshToken(refreshToken);
  if (!payload) {
    throw new AppError(401, 'INVALID_TOKEN', 'Invalid or expired token');
  }

  await verifyStoredRefreshToken(payload, refreshToken);

  const accessToken = generateAccessToken({
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  });

  return { accessToken };
};

export const logout = async (refreshToken: string): Promise<void> => {
  const payload = verifyRefreshToken(refreshToken);

  if (!payload) {
    return;
  }

  await getRedis().del(String(refreshKeyForUser(payload.userId)));
};

export const getMe = async (userId: string): Promise<PublicUser> => {
  const user = await findUserById(userId);

  if (!user) {
    throw new AppError(404, 'NOT_FOUND', 'User not found');
  }

  return toPublicUser(user);
};

const buildMailer = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        }
      : undefined,
  });
};

const mailer = buildMailer();

const parseResetPayload = (storedValue: string): { userId: string; email: string } => {
  try {
    const parsed: unknown = JSON.parse(storedValue);

    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !('userId' in parsed) ||
      !('email' in parsed) ||
      typeof (parsed as { userId: unknown }).userId !== 'string' ||
      typeof (parsed as { email: unknown }).email !== 'string'
    ) {
      throw new AppError(400, 'INVALID_TOKEN', 'Invalid or expired reset token');
    }

    return {
      userId: (parsed as { userId: string }).userId,
      email: (parsed as { email: string }).email,
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(400, 'INVALID_TOKEN', 'Invalid or expired reset token');
  }
};

export const forgotPassword = async (input: ForgotPasswordInput): Promise<void> => {
  const user = await findUserByEmail(input.email);

  if (!user) {
    return;
  }

  const token = crypto.randomUUID();
  await getRedis().setex(
    String(resetKey(token)),
    RESET_TOKEN_TTL_SECONDS,
    JSON.stringify({ userId: user.id, email: user.email })
  );

  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

  await mailer.sendMail({
    from: process.env.EMAIL_FROM || 'no-reply@example.com',
    to: user.email,
    subject: 'Password reset request',
    text: `Use this link to reset your password: ${resetUrl}`,
    html: `<p>Use this link to reset your password:</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
  });
};

export const resetPassword = async (input: ResetPasswordInput): Promise<void> => {
  const storedValue = await getRedis().get(String(resetKey(input.token)));

  if (!storedValue) {
    throw new AppError(400, 'INVALID_TOKEN', 'Invalid or expired reset token');
  }

  const parsed = parseResetPayload(storedValue);
  const newPasswordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  const updated = await updateUserPassword(parsed.userId, newPasswordHash);
  if (!updated) {
    throw new AppError(404, 'NOT_FOUND', 'User not found');
  }

  await getRedis().del(String(resetKey(input.token)));
};

export const authService = {
  register,
  login,
  refresh,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
};

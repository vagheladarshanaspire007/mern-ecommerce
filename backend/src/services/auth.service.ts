import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import nodemailer from 'nodemailer';
import { AppError } from '../utils/AppError';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  TokenPayload,
} from '../utils/jwt';
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateUserPassword,
  toPublicUser,
  PublicUser,
  UserRow,
  storeResetToken,
  findUserByResetToken,
  clearResetToken,
} from '../models/user.model';

const BCRYPT_ROUNDS = 12;
const RESET_TOKEN_TTL_SECONDS = 60 * 60;
const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60;

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

const refreshExpiresAt = (): Date => {
  return new Date(Date.now() + REFRESH_TOKEN_TTL_SECONDS * 1000);
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

  await storeResetToken(createdUser.id, tokens.refreshToken, refreshExpiresAt());

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

  await storeResetToken(user.id, tokens.refreshToken, refreshExpiresAt());

  return {
    user: toPublicUser(user),
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
  };
};

export const refresh = async (
  refreshToken: string
): Promise<{ user: PublicUser; accessToken: string }> => {
  const payload = verifyRefreshToken(refreshToken);

  if (!payload) {
    throw new AppError(401, 'INVALID_TOKEN', 'Invalid or expired token');
  }

  const user = await findUserByResetToken(refreshToken);

  if (!user) {
    throw new AppError(401, 'INVALID_TOKEN', 'Invalid or expired token');
  }

  const publicUser = toPublicUser(user);
  const accessToken = generateAccessToken({
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  });

  return { user: publicUser, accessToken };
};

export const logout = async (refreshToken: string): Promise<void> => {
  const user = await findUserByResetToken(refreshToken);

  if (!user) {
    throw new AppError(401, 'INVALID_TOKEN', 'Invalid or expired token');
  }

  await clearResetToken(user.id);
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

export const forgotPassword = async (input: ForgotPasswordInput): Promise<void> => {
  const user = await findUserByEmail(input.email);

  if (!user) {
    return;
  }

  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_SECONDS * 1000);

  await storeResetToken(user.id, token, expiresAt);

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
  const user = await findUserByResetToken(input.token);

  if (!user) {
    throw new AppError(400, 'INVALID_TOKEN', 'Invalid or expired reset token');
  }

  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

  await updateUserPassword(user.id, passwordHash);
  await clearResetToken(user.id);
};

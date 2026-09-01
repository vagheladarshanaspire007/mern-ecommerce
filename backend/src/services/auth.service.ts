import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { cacheDel, cacheGet, cacheSet } from '../config/redis';
import { UserModel, type User } from '../models/user.model';
import { AppError } from '../utils/AppError';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';
import { sendPasswordResetEmail } from '../utils/email';
import type {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from '../validators/auth.validator';

const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60;
const RESET_TOKEN_TTL = 60 * 60;
const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password';

const getSafeUser = (user: User) => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role,
  emailVerified: user.emailVerified,
  createdAt: user.createdAt,
});

const createTokens = async (user: User) => {
  const payload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await cacheSet(`refresh:${user.id}`, refreshToken, REFRESH_TOKEN_TTL);

  return { accessToken, refreshToken };
};

export const AuthService = {
  register: async (data: RegisterDto) => {
    const existing = await UserModel.findByEmail(data.email);

    if (existing) {
      throw new AppError(
        409,
        'EMAIL_TAKEN',
        'An account with this email already exists'
      );
    }

    const user = await UserModel.create(data);
    const tokens = await createTokens(user);

    return {
      user: getSafeUser(user),
      ...tokens,
    };
  },

  login: async (data: LoginDto) => {
    const user = await UserModel.findByEmail(data.email);

    if (!user) {
      throw new AppError(
        401,
        'INVALID_CREDENTIALS',
        INVALID_CREDENTIALS_MESSAGE
      );
    }

    const isValid = await UserModel.verifyPassword(
      data.password,
      user.passwordHash
    );

    if (!isValid) {
      throw new AppError(
        401,
        'INVALID_CREDENTIALS',
        INVALID_CREDENTIALS_MESSAGE
      );
    }

    const tokens = await createTokens(user);

    return {
      user: getSafeUser(user),
      ...tokens,
    };
  },

  refresh: async (refreshToken: string | undefined) => {
    if (!refreshToken) {
      throw new AppError(401, 'INVALID_TOKEN', 'Invalid or expired token');
    }

    const payload = verifyRefreshToken(refreshToken);

    if (!payload) {
      throw new AppError(401, 'INVALID_TOKEN', 'Invalid or expired token');
    }

    const storedToken = await cacheGet<string>(`refresh:${payload.userId}`);

    if (!storedToken || storedToken !== refreshToken) {
      throw new AppError(401, 'INVALID_TOKEN', 'Invalid or expired token');
    }

    const user = await UserModel.findById(payload.userId);

    if (!user) {
      throw new AppError(401, 'INVALID_TOKEN', 'Invalid or expired token');
    }

    const tokens = await createTokens(user);

    return {
      user: getSafeUser(user),
      ...tokens,
    };
  },

  logout: async (userId: string) => {
    await cacheDel(`refresh:${userId}`);
  },

  getMe: async (userId: string) => {
    const user = await UserModel.findById(userId);

    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    return getSafeUser(user);
  },

  forgotPassword: async (data: ForgotPasswordDto) => {
    const user = await UserModel.findByEmail(data.email);

    if (!user) {
      return;
    }

    const resetToken = crypto.randomUUID();

    await cacheSet(
      `password-reset:${resetToken}`,
      user.id,
      RESET_TOKEN_TTL
    );

    await sendPasswordResetEmail(user.email, resetToken);
  },

  resetPassword: async (data: ResetPasswordDto) => {
    const userId = await cacheGet<string>(
      `password-reset:${data.token}`
    );

    if (!userId) {
      throw new AppError(
        400,
        'INVALID_RESET_TOKEN',
        'Invalid or expired reset token'
      );
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      await cacheDel(`password-reset:${data.token}`);
      throw new AppError(
        400,
        'INVALID_RESET_TOKEN',
        'Invalid or expired reset token'
      );
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    await UserModel.updatePassword(user.id, passwordHash);
    await cacheDel(`password-reset:${data.token}`);
  },
};
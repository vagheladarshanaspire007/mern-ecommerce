import { Request, Response } from 'express';
import { refreshCookieOptions } from '../utils/jwt';
import {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from '../validators/auth.validator';
import {
  register,
  login,
  refresh,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
} from '../services/auth.service';
import { t } from '../utils/i18n';
import { AUTH_MESSAGES } from '../constants/messages';

type CookiesWithRefreshToken = {
  refreshToken?: string;
};

type AuthRequest<TBody> = Request<unknown, unknown, TBody> & {
  cookies?: CookiesWithRefreshToken;
};

const setRefreshCookie = (res: Response, refreshToken: string): void => {
  res.cookie('refreshToken', refreshToken, {
    ...refreshCookieOptions,
  });
};

const clearRefreshCookie = (res: Response): void => {
  res.clearCookie('refreshToken', {
    ...refreshCookieOptions,
  });
};

const getRefreshCookie = (req: AuthRequest<unknown>): string | undefined => {
  const value = req.cookies?.refreshToken;
  return typeof value === 'string' && value.length > 0 ? value : undefined;
};

export const registerController = async (
  req: AuthRequest<RegisterDto>,
  res: Response
): Promise<void> => {
  const { firstName, lastName, email, password } = req.body;

  const result = await register({
    firstName,
    lastName,
    email,
    password,
  });

  setRefreshCookie(res, result.refreshToken);

  res.status(201).json({
    success: true,
    message: t(AUTH_MESSAGES.USER_CREATED),
    user: result.user,
    accessToken: result.accessToken,
  });
};

export const loginController = async (req: AuthRequest<LoginDto>, res: Response): Promise<void> => {
  const { email, password } = req.body;

  const result = await login({
    email,
    password,
  });

  setRefreshCookie(res, result.refreshToken);

  res.status(200).json({
    success: true,
    message: t(AUTH_MESSAGES.LOGIN_SUCCESS),
    user: result.user,
    accessToken: result.accessToken,
  });
};

export const refreshController = async (
  req: AuthRequest<unknown>,
  res: Response
): Promise<void> => {
  const refreshToken = getRefreshCookie(req);

  if (!refreshToken) {
    res.status(401).json({
      success: false,
      message: t(AUTH_MESSAGES.INVALID_OR_EXPIRED_TOKEN),
    });
    return;
  }

  const result = await refresh(refreshToken);

  res.status(200).json({
    success: true,
    accessToken: result.accessToken,
  });
};

export const logoutController = async (req: AuthRequest<unknown>, res: Response): Promise<void> => {
  const refreshToken = getRefreshCookie(req);

  if (refreshToken) {
    await logout(refreshToken);
  }

  clearRefreshCookie(res);

  res.status(200).json({
    success: true,
    message: t(AUTH_MESSAGES.LOGGED_OUT),
  });
};

export const meController = async (req: AuthRequest<unknown>, res: Response): Promise<void> => {
  const userId = req.user?.userId;

  if (!userId) {
    res.status(401).json({
      success: false,
      message: t(AUTH_MESSAGES.AUTH_REQUIRED),
    });
    return;
  }

  const user = await getMe(userId);

  res.status(200).json({
    success: true,
    user,
  });
};

export const forgotPasswordController = async (
  req: AuthRequest<ForgotPasswordDto>,
  res: Response
): Promise<void> => {
  const { email } = req.body;

  await forgotPassword({
    email,
  });

  res.status(200).json({
    success: true,
    message: t(AUTH_MESSAGES.RESET_LINK_SENT),
  });
};

export const resetPasswordController = async (
  req: AuthRequest<ResetPasswordDto>,
  res: Response
): Promise<void> => {
  const { token, password } = req.body;

  await resetPassword({
    token,
    password,
  });

  res.status(200).json({
    success: true,
    message: t(AUTH_MESSAGES.RESET_SUCCESS),
  });
};

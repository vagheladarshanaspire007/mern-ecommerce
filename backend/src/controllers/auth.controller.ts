import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { refreshCookieOptions } from '../utils/jwt';
import type {
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
} from '../validators/auth.validator';

const REFRESH_COOKIE = 'refreshToken';

export const register = async (req: Request, res: Response): Promise<void> => {
  const data = req.body as RegisterDto;
  const { user, accessToken, refreshToken } = await AuthService.register(data);

  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions);

  res.status(201).json({
    success: true,
    data: {
      user,
      accessToken,
    },
  });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const data = req.body as LoginDto;
  const { user, accessToken, refreshToken } = await AuthService.login(data);

  res.cookie(REFRESH_COOKIE, refreshToken, refreshCookieOptions);

  res.json({
    success: true,
    data: {
      user,
      accessToken,
    },
  });
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE] as string | undefined;
  const result = await AuthService.refresh(refreshToken);

  res.cookie(REFRESH_COOKIE, result.refreshToken, refreshCookieOptions);

  res.json({
    success: true,
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  await AuthService.logout(req.user!.userId);

  res.clearCookie(REFRESH_COOKIE, {
    path: refreshCookieOptions.path,
  });

  res.json({
    success: true,
    data: {
      message: 'Logged out successfully',
    },
  });
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  const user = await AuthService.getMe(req.user!.userId);

  res.json({
    success: true,
    data: {
      user,
    },
  });
};

export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const data = req.body as ForgotPasswordDto;

  await AuthService.forgotPassword(data);

  res.json({
    success: true,
    data: {
      message: 'If an account exists, a password reset email has been sent',
    },
  });
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const data = req.body as ResetPasswordDto;

  await AuthService.resetPassword(data);

  res.json({
    success: true,
    data: {
      message: 'Password reset successfully',
    },
  });
};
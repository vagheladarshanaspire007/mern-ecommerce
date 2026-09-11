import { AuthService } from '../auth.service';
import { UserModel } from '../../models/user.model';
import { cacheDel, cacheGet, cacheSet } from '../../config/redis';

jest.mock('../../models/user.model', () => ({
  UserModel: {
    findByEmail: jest.fn(),
    create: jest.fn(),
    verifyPassword: jest.fn(),
    findById: jest.fn(),
    updatePassword: jest.fn(),
  },
}));

jest.mock('../../config/redis', () => ({
  cacheDel: jest.fn(),
  cacheGet: jest.fn(),
  cacheSet: jest.fn(),
}));

jest.mock('../../utils/jwt', () => ({
  generateAccessToken: jest.fn(() => 'access-token'),
  generateRefreshToken: jest.fn(() => 'refresh-token'),
  verifyRefreshToken: jest.fn(),
}));

jest.mock('../../utils/email', () => ({
  sendPasswordResetEmail: jest.fn(),
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('new-hashed-password'),
}));

const mockUser = {
  id: 'user-1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  passwordHash: 'hashed-password',
  role: 'user' as const,
  emailVerified: true,
  createdAt: new Date(),
};

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('registers a new user successfully', async () => {
      (UserModel.findByEmail as jest.Mock).mockResolvedValue(null);
      (UserModel.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await AuthService.register({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'Password123!',
        confirmPassword: 'Password123!',
      });

      expect(UserModel.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(UserModel.create).toHaveBeenCalled();
      expect(result.user).toEqual(
        expect.objectContaining({
          id: 'user-1',
          email: 'john@example.com',
        })
      );
      expect(result).toEqual(
        expect.objectContaining({
          accessToken: expect.any(String),
          refreshToken: expect.any(String),
        })
      );
    });

    it('throws 409 when email already exists', async () => {
      (UserModel.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        AuthService.register({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'Password123!',
          confirmPassword: 'Password123!',
        })
      ).rejects.toMatchObject({
        statusCode: 409,
      });

      expect(UserModel.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('logs in successfully with valid credentials', async () => {
      (UserModel.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (UserModel.verifyPassword as jest.Mock).mockResolvedValue(true);

      const result = await AuthService.login({
        email: 'john@example.com',
        password: 'Password123!',
        rememberMe: false,
      });

      expect(UserModel.findByEmail).toHaveBeenCalledWith('john@example.com');
      expect(UserModel.verifyPassword).toHaveBeenCalledWith(
        'Password123!',
        'hashed-password'
      );
      expect(result.user).toEqual(
        expect.objectContaining({
          id: 'user-1',
          email: 'john@example.com',
        })
      );
      expect(result.accessToken).toBe('access-token');
      expect(result.refreshToken).toBe('refresh-token');
    });

    it('throws 401 when password is incorrect', async () => {
      (UserModel.findByEmail as jest.Mock).mockResolvedValue(mockUser);
      (UserModel.verifyPassword as jest.Mock).mockResolvedValue(false);

      await expect(
        AuthService.login({
          email: 'john@example.com',
          password: 'WrongPassword!',
          rememberMe: false,
        })
      ).rejects.toMatchObject({
        statusCode: 401,
      });
    });
  });

  describe('logout', () => {
    it('deletes the refresh token from Redis', async () => {
      (cacheDel as jest.Mock).mockResolvedValue(undefined);

      await AuthService.logout('user-1');

      expect(cacheDel).toHaveBeenCalledWith('refresh:user-1');
    });
  });
});


describe('AuthService additional coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects login when user does not exist', async () => {
    (UserModel.findByEmail as jest.Mock).mockResolvedValue(null);
    await expect(AuthService.login({
      email: 'missing@example.com',
      password: 'Password123!',
      rememberMe: false,
    })).rejects.toMatchObject({ statusCode: 401 });
  });

  it('refreshes with a valid refresh token', async () => {
    const { verifyRefreshToken } = require('../../utils/jwt');
    (verifyRefreshToken as jest.Mock).mockReturnValue({ userId: 'user-1' });
    (cacheGet as jest.Mock).mockResolvedValue('refresh-token');
    (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await AuthService.refresh('refresh-token');

    expect(result.accessToken).toBe('access-token');
    expect(cacheSet).toHaveBeenCalled();
  });

  it('rejects refresh without a token', async () => {
    await expect(AuthService.refresh(undefined))
      .rejects.toMatchObject({ statusCode: 401 });
  });

  it('rejects an invalid refresh token', async () => {
    const { verifyRefreshToken } = require('../../utils/jwt');
    (verifyRefreshToken as jest.Mock).mockReturnValue(null);

    await expect(AuthService.refresh('bad-token'))
      .rejects.toMatchObject({ statusCode: 401 });
  });

  it('rejects a mismatched stored refresh token', async () => {
    const { verifyRefreshToken } = require('../../utils/jwt');
    (verifyRefreshToken as jest.Mock).mockReturnValue({ userId: 'user-1' });
    (cacheGet as jest.Mock).mockResolvedValue('different-token');

    await expect(AuthService.refresh('refresh-token'))
      .rejects.toMatchObject({ statusCode: 401 });
  });

  it('rejects refresh when user no longer exists', async () => {
    const { verifyRefreshToken } = require('../../utils/jwt');
    (verifyRefreshToken as jest.Mock).mockReturnValue({ userId: 'user-1' });
    (cacheGet as jest.Mock).mockResolvedValue('refresh-token');
    (UserModel.findById as jest.Mock).mockResolvedValue(null);

    await expect(AuthService.refresh('refresh-token'))
      .rejects.toMatchObject({ statusCode: 401 });
  });

  it('returns safe user from getMe', async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

    const result = await AuthService.getMe('user-1');

    expect(result.email).toBe('john@example.com');
    expect(result).not.toHaveProperty('passwordHash');
  });

  it('rejects getMe when user does not exist', async () => {
    (UserModel.findById as jest.Mock).mockResolvedValue(null);

    await expect(AuthService.getMe('missing'))
      .rejects.toMatchObject({ statusCode: 404 });
  });
});


describe('AuthService password reset', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends a password reset email for an existing user', async () => {
    const { sendPasswordResetEmail } = require('../../utils/email');
    (UserModel.findByEmail as jest.Mock).mockResolvedValue(mockUser);

    await AuthService.forgotPassword({ email: 'john@example.com' });

    expect(cacheSet).toHaveBeenCalledWith(
      expect.stringMatching(/^password-reset:/),
      'user-1',
      expect.any(Number)
    );
    expect(sendPasswordResetEmail).toHaveBeenCalledWith(
      'john@example.com',
      expect.any(String)
    );
  });

  it('does nothing when forgot-password user does not exist', async () => {
    (UserModel.findByEmail as jest.Mock).mockResolvedValue(null);

    await expect(
      AuthService.forgotPassword({ email: 'missing@example.com' })
    ).resolves.toBeUndefined();

    expect(cacheSet).not.toHaveBeenCalled();
  });

  it('rejects an invalid reset token', async () => {
    (cacheGet as jest.Mock).mockResolvedValue(null);

    await expect(
      AuthService.resetPassword({
        token: 'bad-token',
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      })
    ).rejects.toMatchObject({ statusCode: 400 });
  });

  it('resets the password with a valid token', async () => {
    (cacheGet as jest.Mock).mockResolvedValue('user-1');
    (UserModel.findById as jest.Mock).mockResolvedValue(mockUser);

    await AuthService.resetPassword({
      token: 'valid-token',
      password: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    });

    expect(UserModel.updatePassword).toHaveBeenCalledWith(
      'user-1',
      'new-hashed-password'
    );
    expect(cacheDel).toHaveBeenCalledWith('password-reset:valid-token');
  });

  it('rejects reset when the user no longer exists', async () => {
    (cacheGet as jest.Mock).mockResolvedValue('user-1');
    (UserModel.findById as jest.Mock).mockResolvedValue(null);

    await expect(
      AuthService.resetPassword({
        token: 'expired-user-token',
        password: 'NewPassword123!',
        confirmPassword: 'NewPassword123!',
      })
    ).rejects.toMatchObject({ statusCode: 400 });

    expect(cacheDel).toHaveBeenCalledWith(
      'password-reset:expired-user-token'
    );
  });
});

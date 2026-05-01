import bcrypt from 'bcryptjs';
import type * as UserModel from '../../models/user.model';
import type * as JwtUtils from '../../utils/jwt';

const mockCreateUser = jest.fn() as jest.MockedFunction<typeof UserModel.createUser>;
const mockFindUserByEmail = jest.fn() as jest.MockedFunction<typeof UserModel.findUserByEmail>;
const mockFindUserById = jest.fn() as jest.MockedFunction<typeof UserModel.findUserById>;
const mockUpdateUserPassword = jest.fn() as jest.MockedFunction<
  typeof UserModel.updateUserPassword
>;
const mockToPublicUser = jest.fn() as jest.MockedFunction<typeof UserModel.toPublicUser>;
const mockStoreResetToken = jest.fn() as jest.MockedFunction<typeof UserModel.storeResetToken>;
const mockFindUserByResetToken = jest.fn() as jest.MockedFunction<
  typeof UserModel.findUserByResetToken
>;
const mockClearResetToken = jest.fn() as jest.MockedFunction<typeof UserModel.clearResetToken>;
const mockGenerateAccessToken = jest.fn() as jest.MockedFunction<
  typeof JwtUtils.generateAccessToken
>;
const mockGenerateRefreshToken = jest.fn() as jest.MockedFunction<
  typeof JwtUtils.generateRefreshToken
>;
const mockVerifyRefreshToken = jest.fn() as jest.MockedFunction<typeof JwtUtils.verifyRefreshToken>;
const mockSendMail = jest.fn() as jest.MockedFunction<(options: unknown) => Promise<void>>;
const mockRandomUUID = jest.fn() as jest.MockedFunction<() => string>;

jest.mock('../../models/user.model', () => ({
  createUser: mockCreateUser,
  findUserByEmail: mockFindUserByEmail,
  findUserById: mockFindUserById,
  updateUserPassword: mockUpdateUserPassword,
  toPublicUser: mockToPublicUser,
  storeResetToken: mockStoreResetToken,
  findUserByResetToken: mockFindUserByResetToken,
  clearResetToken: mockClearResetToken,
}));

jest.mock('../../utils/jwt', () => ({
  generateAccessToken: mockGenerateAccessToken,
  generateRefreshToken: mockGenerateRefreshToken,
  verifyRefreshToken: mockVerifyRefreshToken,
}));

jest.mock('nodemailer', () => ({
  createTransport: () => ({
    sendMail: mockSendMail,
  }),
}));

jest.mock('node:crypto', () => ({
  randomUUID: () => mockRandomUUID(),
}));

import * as authService from '../auth.service';

describe('auth.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.FRONTEND_URL = 'http://localhost:3000';
    mockGenerateAccessToken.mockReturnValue('access-token');
    mockGenerateRefreshToken.mockReturnValue('refresh-token');
    mockVerifyRefreshToken.mockReturnValue({
      userId: 'user-1',
      email: 'user@test.com',
      role: 'user',
    });
    mockToPublicUser.mockImplementation((user) => user as never);
    mockRandomUUID.mockReturnValue('reset-token');
  });

  it('register success', async () => {
    mockFindUserByEmail.mockResolvedValue(null as never);
    mockCreateUser.mockResolvedValue({
      id: 'user-1',
      email: 'user@test.com',
      role: 'user',
    } as never);

    const result = await authService.register({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'user@test.com',
      password: 'Password1',
    });

    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(mockCreateUser).toHaveBeenCalled();
    expect(mockStoreResetToken).toHaveBeenCalledWith('user-1', 'refresh-token', expect.any(Date));
  });

  it('duplicate email 409', async () => {
    mockFindUserByEmail.mockResolvedValue({ id: 'user-1' } as never);

    await expect(
      authService.register({
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'user@test.com',
        password: 'Password1',
      })
    ).rejects.toMatchObject({ statusCode: 409 });
  });

  it('login success', async () => {
    mockFindUserByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'user@test.com',
      role: 'user',
      password_hash: 'hash',
    } as never);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

    const result = await authService.login({ email: 'user@test.com', password: 'Password1' });

    expect(result.accessToken).toBe('access-token');
    expect(result.refreshToken).toBe('refresh-token');
    expect(mockStoreResetToken).toHaveBeenCalled();
  });

  it('wrong password 401', async () => {
    mockFindUserByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'user@test.com',
      role: 'user',
      password_hash: 'hash',
    } as never);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

    await expect(
      authService.login({ email: 'user@test.com', password: 'wrong' })
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it('login missing user 401', async () => {
    mockFindUserByEmail.mockResolvedValue(null as never);

    await expect(
      authService.login({ email: 'missing@test.com', password: 'Password1' })
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it('logout deletes redis key', async () => {
    mockFindUserByResetToken.mockResolvedValue({ id: 'user-1' } as never);

    await authService.logout('refresh-token');

    expect(mockClearResetToken).toHaveBeenCalledWith('user-1');
  });

  it('logout invalid token 401', async () => {
    mockFindUserByResetToken.mockResolvedValue(null as never);

    await expect(authService.logout('refresh-token')).rejects.toMatchObject({ statusCode: 401 });
  });

  it('refresh success', async () => {
    mockFindUserByResetToken.mockResolvedValue({ id: 'user-1' } as never);

    const result = await authService.refresh('refresh-token');

    expect(result).toEqual({ accessToken: 'access-token' });
    expect(mockGenerateAccessToken).toHaveBeenCalledWith({
      userId: 'user-1',
      email: 'user@test.com',
      role: 'user',
    });
  });

  it('refresh invalid token 401', async () => {
    mockVerifyRefreshToken.mockReturnValueOnce(null);

    await expect(authService.refresh('bad-token')).rejects.toMatchObject({ statusCode: 401 });
  });

  it('refresh missing user 401', async () => {
    mockFindUserByResetToken.mockResolvedValue(null as never);

    await expect(authService.refresh('refresh-token')).rejects.toMatchObject({ statusCode: 401 });
  });

  it('getMe success', async () => {
    mockFindUserById.mockResolvedValue({
      id: 'user-1',
      email: 'user@test.com',
      role: 'user',
    } as never);

    const user = await authService.getMe('user-1');

    expect(user).toEqual({
      id: 'user-1',
      email: 'user@test.com',
      role: 'user',
    });
  });

  it('getMe missing user 404', async () => {
    mockFindUserById.mockResolvedValue(null as never);

    await expect(authService.getMe('user-1')).rejects.toMatchObject({ statusCode: 404 });
  });

  it('forgotPassword sends mail and stores reset token', async () => {
    mockFindUserByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'user@test.com',
    } as never);

    await authService.forgotPassword({ email: 'user@test.com' });

    expect(mockRandomUUID).toHaveBeenCalled();
    expect(mockStoreResetToken).toHaveBeenCalledWith('user-1', 'reset-token', expect.any(Date));
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@test.com',
        subject: 'Password reset request',
      })
    );
  });

  it('forgotPassword missing user does nothing', async () => {
    mockFindUserByEmail.mockResolvedValue(null as never);

    await authService.forgotPassword({ email: 'missing@test.com' });

    expect(mockStoreResetToken).not.toHaveBeenCalled();
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it('forgotPassword falls back to localhost when FRONTEND_URL is missing', async () => {
    delete process.env.FRONTEND_URL;
    mockFindUserByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'user@test.com',
    } as never);

    await authService.forgotPassword({ email: 'user@test.com' });

    const mailOptions = mockSendMail.mock.calls[0]?.[0] as { text?: string } | undefined;
    expect(mailOptions).toEqual(
      expect.objectContaining({
        to: 'user@test.com',
        subject: 'Password reset request',
      })
    );
    expect(mailOptions?.text).toContain('http://localhost:3000/reset-password');
  });

  it('resetPassword success', async () => {
    mockFindUserByResetToken.mockResolvedValue({ id: 'user-1' } as never);
    jest.spyOn(bcrypt, 'hash').mockResolvedValue('hashed-password' as never);

    await authService.resetPassword({ token: 'reset-token', password: 'Password1' });

    expect(mockUpdateUserPassword).toHaveBeenCalledWith('user-1', 'hashed-password');
    expect(mockClearResetToken).toHaveBeenCalledWith('user-1');
  });

  it('resetPassword invalid token 400', async () => {
    mockFindUserByResetToken.mockResolvedValue(null as never);

    await expect(
      authService.resetPassword({ token: 'reset-token', password: 'Password1' })
    ).rejects.toMatchObject({ statusCode: 400 });
  });
});

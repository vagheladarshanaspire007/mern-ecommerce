import { registerController, loginController } from '../../controllers/auth.controller';

type MockRes = {
  status: jest.MockedFunction<(code: number) => MockRes>;
  json: jest.MockedFunction<(body: unknown) => MockRes>;
  cookie: jest.MockedFunction<(name: string, value: string, options?: unknown) => MockRes>;
  clearCookie: jest.MockedFunction<(name: string, options?: unknown) => MockRes>;
};

const createMockRes = (): MockRes => {
  const res = {} as MockRes;
  res.status = jest.fn<MockRes, [number]>(() => res);
  res.json = jest.fn<MockRes, [unknown]>(() => res);
  res.cookie = jest.fn<MockRes, [string, string, unknown?]>(() => res);
  res.clearCookie = jest.fn<MockRes, [string, unknown?]>(() => res);
  return res;
};

jest.mock('../../services/auth.service', () => ({
  register: jest.fn(),
  login: jest.fn(),
  refresh: jest.fn(),
  logout: jest.fn(),
  getMe: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn(),
}));

describe('auth.routes', () => {
  it('register route shape', async () => {
    const res = createMockRes();
    const req = {
      body: { firstName: 'Jane', lastName: 'Doe', email: 'user@test.com', password: 'Password1' },
    } as Parameters<typeof registerController>[0];
    const service = await import('../../services/auth.service');
    const registerMock = service.register as jest.MockedFunction<typeof service.register>;
    registerMock.mockResolvedValue({
      user: {
        id: 'u1',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'user@test.com',
        address: null,
        role: 'user',
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      accessToken: 'access',
      refreshToken: 'refresh',
    } as Awaited<ReturnType<typeof service.register>>);

    await registerController(req, res as unknown as Parameters<typeof registerController>[1]);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });

  it('login route shape', async () => {
    const res = createMockRes();
    const req = {
      body: { email: 'user@test.com', password: 'Password1' },
    } as Parameters<typeof loginController>[0];
    const service = await import('../../services/auth.service');
    const loginMock = service.login as jest.MockedFunction<typeof service.login>;
    loginMock.mockResolvedValue({
      user: {
        id: 'u1',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'user@test.com',
        address: null,
        role: 'user',
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      accessToken: 'access',
      refreshToken: 'refresh',
    } as Awaited<ReturnType<typeof service.login>>);

    await loginController(req, res as unknown as Parameters<typeof loginController>[1]);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
  });
});

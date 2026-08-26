import { http, HttpResponse } from 'msw';

const API_URL = '/api/v1';

type MockUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'user' | 'admin';
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

type MockStoredUser = MockUser & {
  password: string;
};

const defaultUser: MockStoredUser = {
  id: 'mock-user-001',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  password: 'Password123',
  role: 'user',
  emailVerified: true,
  createdAt: '2026-08-01T10:00:00.000Z',
  updatedAt: '2026-08-01T10:00:00.000Z',
};

const mockUsers: MockStoredUser[] = [defaultUser];

const mockAccessToken = 'mock-access-token-ec201';

const SESSION_KEY = 'mock-auth-session';
const CURRENT_USER_KEY = 'mock-current-user';

const getMockSession = (): boolean => {
  return localStorage.getItem(SESSION_KEY) === 'true';
};

const setMockSession = (authenticated: boolean): void => {
  if (authenticated) {
    localStorage.setItem(SESSION_KEY, 'true');
  } else {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
  }
};

const setCurrentUser = (userId: string): void => {
  localStorage.setItem(CURRENT_USER_KEY, userId);
};

const getCurrentUser = (): MockStoredUser | null => {
  const userId = localStorage.getItem(CURRENT_USER_KEY);

  if (!userId) {
    return null;
  }

  return mockUsers.find((user) => user.id === userId) ?? null;
};

const sanitizeUser = (user: MockStoredUser): MockUser => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password: _password, ...safeUser } = user;

  return safeUser;
};

const mockProducts = [
  {
    id: 'product-001',
    name: 'Wireless Headphones',
    description: 'Premium wireless headphones',
    price: 2999,
    stock: 25,
    imageUrls: [],
    isActive: true,
    createdAt: '2026-08-01T10:00:00.000Z',
    updatedAt: '2026-08-01T10:00:00.000Z',
  },
  {
    id: 'product-002',
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical keyboard',
    price: 4999,
    stock: 15,
    imageUrls: [],
    isActive: true,
    createdAt: '2026-08-02T10:00:00.000Z',
    updatedAt: '2026-08-02T10:00:00.000Z',
  },
  {
    id: 'product-003',
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse',
    price: 1499,
    stock: 40,
    imageUrls: [],
    isActive: true,
    createdAt: '2026-08-03T10:00:00.000Z',
    updatedAt: '2026-08-03T10:00:00.000Z',
  },
];

export const handlers = [
  // Login
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as {
      email: string;
      password: string;
      rememberMe?: boolean;
    };

    // eslint-disable-next-line no-console
    console.log('[MSW] LOGIN REQUEST:', body);

    const user = mockUsers.find(
      (item) =>
        item.email.toLowerCase() === body.email.toLowerCase() && item.password === body.password
    );

    if (!user) {
      // eslint-disable-next-line no-console
      console.log('[MSW] Login failed');

      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password',
          },
        },
        { status: 401 }
      );
    }

    setMockSession(true);
    setCurrentUser(user.id);

    // eslint-disable-next-line no-console
    console.log('[MSW] Login successful');
    // eslint-disable-next-line no-console
    console.log('[MSW] User:', sanitizeUser(user));
    // eslint-disable-next-line no-console
    console.log('[MSW] Session:', getMockSession());

    return HttpResponse.json(
      {
        success: true,
        data: {
          user: sanitizeUser(user),
          accessToken: mockAccessToken,
        },
      },
      { status: 200 }
    );
  }),

  // Register
  http.post(`${API_URL}/auth/register`, async ({ request }) => {
    const body = (await request.json()) as {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      confirmPassword: string;
    };

    // eslint-disable-next-line no-console
    console.log('[MSW] REGISTER REQUEST:', {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
    });

    const normalizedEmail = body.email.trim().toLowerCase();

    const existingUser = mockUsers.find((user) => user.email.toLowerCase() === normalizedEmail);

    if (existingUser) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'EMAIL_TAKEN',
            message: 'Email is already registered',
          },
        },
        { status: 409 }
      );
    }

    if (body.password !== body.confirmPassword) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'PASSWORD_MISMATCH',
            message: 'Passwords do not match',
          },
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const newUser: MockStoredUser = {
      id: `mock-user-${Date.now()}`,
      firstName: body.firstName,
      lastName: body.lastName,
      email: normalizedEmail,
      password: body.password,
      role: 'user',
      emailVerified: false,
      createdAt: now,
      updatedAt: now,
    };

    mockUsers.push(newUser);

    setMockSession(true);
    setCurrentUser(newUser.id);

    // eslint-disable-next-line no-console
    console.log('[MSW] Registration successful');
    // eslint-disable-next-line no-console
    console.log('[MSW] Registered user:', sanitizeUser(newUser));

    return HttpResponse.json(
      {
        success: true,
        data: {
          user: sanitizeUser(newUser),
          accessToken: mockAccessToken,
        },
      },
      { status: 201 }
    );
  }),

  // Refresh
  http.post(`${API_URL}/auth/refresh`, () => {
    const authenticated = getMockSession();
    const currentUser = getCurrentUser();

    // eslint-disable-next-line no-console
    console.log('[MSW] REFRESH REQUEST');
    // eslint-disable-next-line no-console
    console.log('[MSW] Session:', authenticated);

    if (!authenticated || !currentUser) {
      setMockSession(false);

      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'No active session',
          },
        },
        { status: 401 }
      );
    }

    return HttpResponse.json(
      {
        success: true,
        data: {
          user: sanitizeUser(currentUser),
          accessToken: mockAccessToken,
        },
      },
      { status: 200 }
    );
  }),

  // Current User
  http.get(`${API_URL}/auth/me`, () => {
    const authenticated = getMockSession();
    const currentUser = getCurrentUser();

    if (!authenticated || !currentUser) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Not authenticated',
          },
        },
        { status: 401 }
      );
    }

    return HttpResponse.json(
      {
        success: true,
        data: sanitizeUser(currentUser),
      },
      { status: 200 }
    );
  }),

  // Logout
  http.post(`${API_URL}/auth/logout`, () => {
    // eslint-disable-next-line no-console
    console.log('[MSW] LOGOUT');

    setMockSession(false);

    return HttpResponse.json(
      {
        success: true,
        data: null,
      },
      { status: 200 }
    );
  }),

  // Forgot Password
  http.post(`${API_URL}/auth/forgot-password`, () => {
    return HttpResponse.json(
      {
        success: true,
        data: null,
      },
      { status: 200 }
    );
  }),

  // Products
  http.get(`${API_URL}/products`, ({ request }) => {
    const url = new URL(request.url);

    const search = url.searchParams.get('search')?.toLowerCase();
    const limit = Number(url.searchParams.get('limit')) || 12;

    let products = mockProducts;

    if (search) {
      products = mockProducts.filter((product) => product.name.toLowerCase().includes(search));
    }

    const limitedProducts = products.slice(0, limit);

    return HttpResponse.json({
      success: true,
      data: {
        items: limitedProducts,
        total: products.length,
        page: 1,
        pageSize: limitedProducts.length,
        hasNextPage: false,
      },
    });
  }),
];

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

const createMockSession = (): void => {
  localStorage.setItem(SESSION_KEY, 'true');
};

const clearMockSession = (): void => {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(CURRENT_USER_KEY);
};

const setCurrentUser = (userId: string): void => {
  localStorage.setItem(CURRENT_USER_KEY, userId);
};

const getCurrentUser = (): MockStoredUser | null => {
  const sessionExists = localStorage.getItem(SESSION_KEY) === 'true';
  const userId = localStorage.getItem(CURRENT_USER_KEY);

  if (!sessionExists || !userId) {
    return null;
  }

  // .find() is intentional because the complete user object is required.
  return mockUsers.find((user) => user.id === userId) ?? null;
};

const sanitizeUser = (user: MockStoredUser): MockUser => {
  // Password is intentionally excluded from the response.
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
  // ============================================================
  // Login
  // ============================================================
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as {
      email: string;
      password: string;
      rememberMe?: boolean;
    };

    const normalizedEmail = body.email.trim().toLowerCase();

    const user = mockUsers.find(
      (item) => item.email.toLowerCase() === normalizedEmail && item.password === body.password
    );

    if (!user) {
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

    // Login creates the authenticated session.
    createMockSession();
    setCurrentUser(user.id);

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

  // ============================================================
  // Register
  // ============================================================
  http.post(`${API_URL}/auth/register`, async ({ request }) => {
    const body = (await request.json()) as {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      confirmPassword: string;
    };

    const normalizedEmail = body.email.trim().toLowerCase();

    const emailAlreadyRegistered = mockUsers.some(
      (user) => user.email.toLowerCase() === normalizedEmail
    );

    if (emailAlreadyRegistered) {
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
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      email: normalizedEmail,
      password: body.password,
      role: 'user',
      emailVerified: false,
      createdAt: now,
      updatedAt: now,
    };

    mockUsers.push(newUser);

    /*
     * Registration does NOT authenticate the user.
     *
     * The user must go to the login page and authenticate
     * using the newly registered email and password.
     *
     * Therefore:
     * - No createMockSession()
     * - No setCurrentUser()
     * - No accessToken in the response
     */
    return HttpResponse.json(
      {
        success: true,
        data: {
          user: sanitizeUser(newUser),
        },
      },
      { status: 201 }
    );
  }),

  // ============================================================
  // Refresh
  // ============================================================
  http.post(`${API_URL}/auth/refresh`, () => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
      clearMockSession();

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

  // ============================================================
  // Current User
  // ============================================================
  http.get(`${API_URL}/auth/me`, () => {
    const currentUser = getCurrentUser();

    if (!currentUser) {
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

  // ============================================================
  // Logout
  // ============================================================
  http.post(`${API_URL}/auth/logout`, () => {
    clearMockSession();

    return HttpResponse.json(
      {
        success: true,
        data: null,
      },
      { status: 200 }
    );
  }),

  // ============================================================
  // Forgot Password
  // ============================================================
  http.post(`${API_URL}/auth/forgot-password`, () => {
    /*
     * Always return the same generic success response.
     * This prevents revealing whether an email is registered.
     */
    return HttpResponse.json(
      {
        success: true,
        data: null,
        message: 'If an account exists with this email, a password reset link has been sent.',
      },
      { status: 200 }
    );
  }),

  // ============================================================
  // Products
  // ============================================================
  http.get(`${API_URL}/products`, ({ request }) => {
    const url = new URL(request.url);

    const search = url.searchParams.get('search')?.trim().toLowerCase();
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

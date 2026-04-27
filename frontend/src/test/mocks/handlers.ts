import { http, HttpResponse } from 'msw';
import type { RegisterData, User } from '@/types/auth.types';

interface UserRecord {
  user: User;
  password?: string;
}

interface AuthState {
  currentUserId: string | null;
  accessToken: string | null;
  refreshToken: string | null;
}

const now = new Date().toISOString();

const STORAGE_KEYS = {
  users: 'msw:auth:users',
  session: 'msw:auth:session',
} as const;

const getStorage = (): Storage | null => {
  try {
    return (globalThis as unknown as { localStorage?: Storage }).localStorage ?? null;
  } catch {
    return null;
  }
};

const storage = getStorage();

// Generate expected password from email following password policies
// Pattern: EmailPrefix + "123" + SpecialChar + Uppercase
const generateExpectedPassword = (email: string): string => {
  const emailPrefix = email.toLowerCase().split('@')[0];
  const firstChar = emailPrefix.charAt(0).toUpperCase();
  const restChars = emailPrefix.slice(1).toLowerCase();
  const specialChar = '!';
  const number = '123';

  return `${firstChar}${restChars}${number}${specialChar}`;
};

const verifyPasswordPattern = (email: string, password: string): boolean => {
  const expectedPassword = generateExpectedPassword(email);
  return password === expectedPassword;
};

const DUMMY_EMAILS = [
  'admin@example.com',
  'manager@example.com',
  'user@example.com',
  'john@example.com',
  'jane@example.com',
];

// Dummy users - only user data, no passwords stored
const seedUsers: UserRecord[] = [
  {
    user: {
      id: 'user_admin_001',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      role: 'admin',
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    },
  },
  {
    user: {
      id: 'user_manager_001',
      firstName: 'Manager',
      lastName: 'Staff',
      email: 'manager@example.com',
      role: 'manager',
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    },
  },
  {
    user: {
      id: 'user_standard_001',
      firstName: 'Standard',
      lastName: 'User',
      email: 'user@example.com',
      role: 'user',
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    },
  },
  {
    user: {
      id: 'user_john_doe',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      role: 'user',
      emailVerified: false,
      createdAt: now,
      updatedAt: now,
    },
  },
  {
    user: {
      id: 'user_jane_smith',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane@example.com',
      role: 'user',
      emailVerified: true,
      createdAt: now,
      updatedAt: now,
    },
  },
];

if (seedUsers.length > 5) {
  throw new Error(
    `Dummy users constraint violated: ${seedUsers.length} users defined. Maximum is 5.`
  );
}

const loadUsers = (): UserRecord[] => {
  if (!storage) return seedUsers;
  try {
    const raw = storage.getItem(STORAGE_KEYS.users);
    if (!raw) {
      saveUsers(seedUsers);
      return seedUsers;
    }
    const parsed = JSON.parse(raw) as UserRecord[];
    return parsed;
  } catch {
    return seedUsers;
  }
};

const saveUsers = (users: UserRecord[]) => {
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  } catch {
    // Ignore quota / privacy mode issues for mocks.
  }
};

const loadSession = (): Pick<AuthState, 'currentUserId' | 'refreshToken'> => {
  if (!storage) return { currentUserId: null, refreshToken: null };
  try {
    const raw = storage.getItem(STORAGE_KEYS.session);
    if (!raw) return { currentUserId: null, refreshToken: null };
    const parsed = JSON.parse(raw) as { currentUserId: string | null; refreshToken: string | null };
    return {
      currentUserId: parsed.currentUserId ?? null,
      refreshToken: parsed.refreshToken ?? null,
    };
  } catch {
    return { currentUserId: null, refreshToken: null };
  }
};

const saveSession = (session: Pick<AuthState, 'currentUserId' | 'refreshToken'>) => {
  if (!storage) return;
  try {
    storage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
  } catch {
    // Ignore
  }
};

const clearSession = () => {
  if (!storage) return;
  try {
    storage.removeItem(STORAGE_KEYS.session);
  } catch {
    // Ignore
  }
};

let userRecords: UserRecord[] = loadUsers();

const authState: AuthState = {
  currentUserId: null,
  accessToken: null,
  refreshToken: null,
};

const mockProducts = [
  {
    id: 'prod_001',
    name: 'Minimal Desk Lamp',
    description: 'Matte black aluminum desk lamp with adjustable arm.',
    price: 79,
    stock: 24,
    imageUrls: ['https://images.unsplash.com/photo-1513506003901-1e6a229e2d15'],
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: 'prod_002',
    name: 'Ergo Office Chair',
    description: 'Breathable mesh ergonomic chair with lumbar support.',
    price: 249,
    stock: 8,
    imageUrls: ['https://images.unsplash.com/photo-1580480055273-228ff5388ef8'],
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
];

const endpointVariants = (path: string) => [`*/api${path}`, `*/api/v1${path}`];

const createAccessToken = () => `mock-access-${crypto.randomUUID()}`;
const createRefreshToken = () => `mock-refresh-${crypto.randomUUID()}`;

const getCurrentUser = (): User | null => {
  // Re-hydrate session in case of page reload or multi-tab.
  const session = loadSession();
  authState.currentUserId = session.currentUserId;
  authState.refreshToken = session.refreshToken;

  if (!authState.currentUserId) return null;
  userRecords = loadUsers();
  const record = userRecords.find((user) => user.user.id === authState.currentUserId);
  return record?.user ?? null;
};

const unauthorizedResponse = () =>
  HttpResponse.json(
    {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Unauthorized',
      },
    },
    { status: 401 }
  );

const badRequestResponse = (message: string, code = 'BAD_REQUEST') =>
  HttpResponse.json(
    {
      success: false,
      error: {
        code,
        message,
      },
    },
    { status: 400 }
  );

const loginHandlers = endpointVariants('/auth/login').map((url) =>
  http.post(url, async ({ request }) => {
    const body = (await request.json().catch(() => null)) as {
      email?: string;
      password?: string;
    } | null;

    if (!body?.email || !body?.password) {
      return badRequestResponse('Email and password are required.');
    }

    const record = userRecords.find(
      ({ user }) => user.email.toLowerCase() === body.email!.toLowerCase()
    );

    if (!record) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password.',
          },
        },
        { status: 401 }
      );
    }

    const isDummyEmail = DUMMY_EMAILS.includes(body.email!.toLowerCase());
    if (isDummyEmail) {
      if (!verifyPasswordPattern(body.email!, body.password)) {
        return HttpResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_CREDENTIALS',
              message: 'Invalid email or password.',
            },
          },
          { status: 401 }
        );
      }
    } else {
      if (!record.password || record.password !== body.password) {
        return HttpResponse.json(
          {
            success: false,
            error: {
              code: 'INVALID_CREDENTIALS',
              message: 'Invalid email or password.',
            },
          },
          { status: 401 }
        );
      }
    }

    authState.currentUserId = record.user.id;
    authState.accessToken = createAccessToken();
    authState.refreshToken = createRefreshToken();
    saveSession({ currentUserId: authState.currentUserId, refreshToken: authState.refreshToken });

    return HttpResponse.json(
      {
        success: true,
        data: {
          user: record.user,
          accessToken: authState.accessToken,
        },
      },
      { status: 200 }
    );
  })
);

const registerHandlers = endpointVariants('/auth/register').map((url) =>
  http.post(url, async ({ request }) => {
    const body = (await request.json().catch(() => null)) as Partial<RegisterData> | null;

    if (!body?.email || !body.password || !body.firstName || !body.lastName) {
      return badRequestResponse('First name, last name, email, and password are required.');
    }

    const existing = userRecords.some(
      ({ user }) => user.email.toLowerCase() === body.email!.toLowerCase()
    );
    if (existing) {
      return badRequestResponse('Email is already registered.', 'EMAIL_EXISTS');
    }

    const user: User = {
      id: `user_${crypto.randomUUID()}`,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      role: 'user',
      emailVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    userRecords.push({ user, password: body.password });
    const accessToken = createAccessToken();
    saveUsers(userRecords);

    return HttpResponse.json(
      {
        success: true,
        data: {
          user,
          accessToken,
        },
      },
      { status: 200 }
    );
  })
);

const refreshHandlers = endpointVariants('/auth/refresh').map((url) =>
  http.post(url, async () => {
    const user = getCurrentUser();
    if (!authState.refreshToken || !user) {
      return unauthorizedResponse();
    }

    authState.accessToken = createAccessToken();

    return HttpResponse.json(
      {
        success: true,
        data: {
          user,
          accessToken: authState.accessToken,
        },
      },
      { status: 200 }
    );
  })
);

const meHandlers = endpointVariants('/auth/me').map((url) =>
  http.get(url, async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    const user = getCurrentUser();

    if (!user || !authState.accessToken || authHeader !== `Bearer ${authState.accessToken}`) {
      return unauthorizedResponse();
    }

    return HttpResponse.json(
      {
        success: true,
        data: user,
      },
      { status: 200 }
    );
  })
);

const logoutHandlers = endpointVariants('/auth/logout').map((url) =>
  http.post(url, async () => {
    authState.currentUserId = null;
    authState.accessToken = null;
    authState.refreshToken = null;
    clearSession();
    return HttpResponse.json(
      {
        success: true,
        data: null,
      },
      { status: 200 }
    );
  })
);

const productHandlers = endpointVariants('/products').map((url) =>
  http.get(url, async () => {
    return HttpResponse.json(
      {
        success: true,
        data: {
          items: mockProducts,
          total: mockProducts.length,
          page: 1,
          pageSize: mockProducts.length,
          hasNextPage: false,
        },
      },
      { status: 200 }
    );
  })
);

export const handlers = [
  ...loginHandlers,
  ...registerHandlers,
  ...refreshHandlers,
  ...meHandlers,
  ...logoutHandlers,
  ...productHandlers,
];

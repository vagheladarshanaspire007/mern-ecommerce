# MERN Stack Boilerplate — E-Commerce Platform

Production-ready boilerplate for the 2-month MERN internship program.  
**Days 41–44: Build a full e-commerce platform on top of this foundation.**

---

## Table of Contents

1. [Tech Stack & Why](#tech-stack--why)
2. [Project Structure](#project-structure)
3. [Prerequisites](#prerequisites)
4. [Getting Started](#getting-started)
5. [Package Reference — Why Each Package Exists](#package-reference--why-each-package-exists)
6. [Day 41 — Architecture & Backend](#day-41--architecture--backend)
7. [Day 42 — Frontend & Features](#day-42--frontend--features)
8. [Day 43 — Testing, Security & Docker](#day-43--testing-security--docker)
9. [Day 44 — Presentation & Code Review](#day-44--presentation--code-review)
10. [Environment Variables Reference](#environment-variables-reference)
11. [API Response Format](#api-response-format)
12. [Git Workflow](#git-workflow)
13. [Troubleshooting](#troubleshooting)

---

## Tech Stack & Why

| Layer | Technology | Why chosen |
|---|---|---|
| Frontend | React 18 + TypeScript | Industry standard, strong typing, large ecosystem |
| State (client) | Redux Toolkit | Predictable global state, excellent DevTools |
| State (server) | React Query | Caching, background sync, deduplication |
| Routing | React Router v6 | Declarative nested routing, lazy loading |
| Forms | React Hook Form + Zod | Best performance, TypeScript-first validation |
| HTTP client | Axios | Interceptors, automatic token refresh |
| Styling | Tailwind CSS | Utility-first, no naming conventions needed |
| Backend | Node.js + Express + TypeScript | Non-blocking I/O, huge ecosystem |
| Database | PostgreSQL | ACID compliance, JSON support, battle-tested |
| Cache | Redis | Sub-millisecond reads, pub/sub, queue backend |
| Auth | JWT + bcrypt | Stateless access tokens, secure password hashing |
| Validation | Zod (FE) + Zod/Joi (BE) | Runtime + compile-time safety |
| File uploads | Multer + Sharp | Multipart parsing, server-side image compression |
| WebSockets | Socket.io | Rooms, reconnection, load balancer support |
| Testing | Vitest + RTL (FE), Jest + Supertest (BE) | Fast, modern, good DX |
| CI/CD | GitHub Actions | Native GitHub integration, free for public repos |
| Quality | SonarQube | Bug/vulnerability/smell detection, coverage gates |
| Containers | Docker + Docker Compose | Environment parity, one-command setup |
| Reverse Proxy | Nginx | Static file serving, WebSocket proxy, SSL |
| Hooks | Husky + lint-staged | Pre-commit quality enforcement |

---

## Project Structure

```
mern-boilerplate/
├── backend/                          # Express API
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.ts           # PostgreSQL pool + query helper
│   │   │   ├── redis.ts              # Redis client + cache helpers
│   │   │   └── socket.ts             # Socket.io initialization
│   │   ├── middleware/
│   │   │   ├── auth/
│   │   │   │   └── authenticate.ts   # JWT verification, role guards
│   │   │   ├── error/
│   │   │   │   ├── errorHandler.ts   # Global error handler (MUST be last)
│   │   │   │   └── notFoundHandler.ts
│   │   │   ├── logging/
│   │   │   │   ├── correlationId.ts  # Request tracing IDs
│   │   │   │   └── requestLogger.ts  # Morgan HTTP logging
│   │   │   ├── security/
│   │   │   │   ├── headers.ts        # Security response headers
│   │   │   │   └── rateLimiter.ts    # Redis-backed rate limiting
│   │   │   ├── validation/
│   │   │   │   └── validateRequest.ts # Zod schema validation
│   │   │   └── upload.ts             # Multer file upload config
│   │   ├── routes/
│   │   │   ├── auth.routes.ts        # /api/v1/auth/*
│   │   │   ├── user.routes.ts        # /api/v1/users/*
│   │   │   ├── product.routes.ts     # /api/v1/products/*
│   │   │   ├── upload.routes.ts      # /api/v1/upload/*
│   │   │   └── health.routes.ts      # /api/health (no version)
│   │   ├── controllers/              # ← YOU BUILD THESE (Day 41)
│   │   │   └── auth.controller.ts    # Extract req data, call service, send response
│   │   ├── services/                 # ← YOU BUILD THESE (Day 41)
│   │   │   └── auth.service.ts       # Business logic (pure, no req/res)
│   │   ├── models/                   # ← YOU BUILD THESE (Day 41)
│   │   │   └── user.model.ts         # Repository pattern (SQL queries)
│   │   ├── validators/
│   │   │   └── auth.validator.ts     # Zod schemas for auth routes
│   │   ├── utils/
│   │   │   ├── AppError.ts           # Custom error class
│   │   │   ├── jwt.ts                # Token generation/verification
│   │   │   ├── logger.ts             # Winston structured logging
│   │   │   ├── migrate.ts            # Database migrations
│   │   │   └── seed.ts               # ← YOU CREATE (Day 41)
│   │   ├── jobs/                     # ← YOU BUILD (Day 43)
│   │   │   └── email.job.ts          # Bull queue for email sending
│   │   ├── types/                    # ← ADD shared types here
│   │   ├── app.ts                    # Express app setup + middleware chain
│   │   └── index.ts                  # Server startup + graceful shutdown
│   ├── Dockerfile                    # Production multi-stage build
│   ├── Dockerfile.dev                # Development with hot reload
│   ├── tsconfig.json
│   ├── .eslintrc.json
│   ├── .prettierrc
│   └── package.json
│
├── frontend/                         # React + Vite SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── MainLayout.tsx    # Shared layout (Navbar + outlet)
│   │   │   │   ├── ProtectedRoute.tsx # Redirect if not authenticated
│   │   │   │   ├── GuestRoute.tsx    # Redirect if already logged in
│   │   │   │   └── AdminRoute.tsx    # Redirect if not admin
│   │   │   ├── ui/
│   │   │   │   └── PageLoader.tsx    # Full-page loading spinner
│   │   │   └── forms/               # ← YOU BUILD (Day 42)
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── LoginPage.tsx     # ← YOU BUILD (Day 41)
│   │   │   │   ├── RegisterPage.tsx  # ← YOU BUILD (Day 41)
│   │   │   │   └── ForgotPasswordPage.tsx
│   │   │   ├── products/
│   │   │   │   ├── ProductListPage.tsx  # ← YOU BUILD (Day 42)
│   │   │   │   └── ProductDetailPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── CartPage.tsx          # ← YOU BUILD (Day 42)
│   │   │   ├── CheckoutPage.tsx      # ← YOU BUILD (Day 42)
│   │   │   ├── ProfilePage.tsx
│   │   │   └── admin/
│   │   │       └── AdminDashboardPage.tsx
│   │   ├── store/
│   │   │   ├── index.ts              # Redux store config + typed hooks
│   │   │   └── slices/
│   │   │       ├── authSlice.ts      # Auth state + async thunks
│   │   │       ├── cartSlice.ts      # Cart state + selectors
│   │   │       └── uiSlice.ts        # Modal/sidebar state
│   │   ├── services/
│   │   │   ├── api.ts                # Axios instance + token refresh interceptor
│   │   │   ├── auth.service.ts       # Auth API calls
│   │   │   └── product.service.ts   # ← YOU BUILD (Day 42)
│   │   ├── hooks/
│   │   │   └── index.ts              # useDebounce, useIntersectionObserver, useAsync
│   │   ├── types/
│   │   │   └── auth.types.ts         # User, Product, Order, API response types
│   │   ├── test/
│   │   │   ├── setup.ts              # Vitest global setup
│   │   │   └── utils.tsx             # Custom render with providers + mock factories
│   │   ├── App.tsx                   # Routes + Suspense
│   │   ├── main.tsx                  # React root + providers
│   │   └── index.css
│   ├── Dockerfile / Dockerfile.dev
│   ├── nginx.conf                    # SPA fallback + asset caching
│   ├── vite.config.ts
│   └── package.json
│
├── docs/
│   └── GITHUB_SETUP.md              # This repo's GitHub configuration guide
├── .github/
│   └── workflows/
│       ├── ci.yml                    # Lint → Type → Test → SonarQube
│       └── deploy.yml                # Build → Deploy (dev/staging/prod)
├── .husky/
│   ├── pre-commit                    # lint-staged (ESLint + Prettier)
│   ├── commit-msg                    # Conventional commits validation
│   └── pre-push                      # TypeScript full type check
├── docker-compose.yml               # Postgres + Redis + API + Frontend + pgAdmin
├── sonar-project.properties          # SonarQube project config
└── package.json                      # Root workspace + Husky install
```

---

## Prerequisites

Install these before starting:

| Tool | Version | Install |
|---|---|---|
| Node.js | 20.x LTS | [nodejs.org](https://nodejs.org) |
| npm | 10.x | Comes with Node |
| Docker Desktop | Latest | [docker.com](https://www.docker.com/products/docker-desktop) |
| Git | Latest | [git-scm.com](https://git-scm.com) |
| VS Code | Latest | [code.visualstudio.com](https://code.visualstudio.com) |

**Recommended VS Code Extensions** (install all of these):
- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)
- TypeScript Error Translator (`mattpocock.ts-error-translator`)
- Thunder Client (`rangav.vscode-thunder-client`) — API testing like Postman
- GitLens (`eamodio.gitlens`)
- Docker (`ms-azuretools.vscode-docker`)
- Tailwind CSS IntelliSense (`bradlc.vscode-tailwindcss`)

---

## Getting Started

### Option A: Docker (Recommended — Zero config)

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_ORG/mern-ecommerce.git
cd mern-ecommerce

# 2. Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 3. Start all services (Postgres, Redis, API, Frontend, pgAdmin)
docker-compose up

# 4. In a separate terminal, run database migrations
docker-compose exec api npm run migrate

# If this is your first time running migrations:
#   npm run migrate up
#
# If you already ran the migration script before and switched branches:
#   npm run migrate down 3
#   npm run migrate up

# 5. Access the apps
#    Frontend:  http://localhost:3000
#    API:       http://localhost:5000/api/health
#    pgAdmin:   http://localhost:5050  (admin@admin.com / admin)
#    Redis:     localhost:6379
```

### Option B: Local Development (Manual)

```bash
# Prerequisites: PostgreSQL and Redis installed locally

# 1. Install all dependencies
npm run install:all

# 2. Set up environment variables
cp backend/.env.example backend/.env
# Edit backend/.env with your local PostgreSQL/Redis credentials

# If this is your first time running migrations:
#   npm run migrate up
#
# If you already ran the migration script before and switched branches:
#   npm run migrate down 3
#   npm run migrate up

# 3. Run database migrations
cd backend && npm run migrate && cd ..

# 4. Start both servers concurrently
npm run dev
# Backend:  http://localhost:5000
# Frontend: http://localhost:3000

# 5. Install Husky git hooks (one time)
npm run prepare
```

### Verify everything works

```bash
# API health check
curl http://localhost:5000/api/health
# Expected: {"status":"ok","uptime":...}

# API readiness (checks DB + Redis)
curl http://localhost:5000/api/health/ready
# Expected: {"status":"ok","checks":{"database":"ok","redis":"ok"}}

# Frontend
open http://localhost:3000
# Expected: App loads, shows product page stub
```

---

## Package Reference — Why Each Package Exists

### Backend Packages

#### Security
| Package | Why it's here |
|---|---|
| `helmet` | Sets 14 HTTP security headers in one call. Prevents clickjacking (X-Frame-Options), XSS (Content-Security-Policy), MIME sniffing (X-Content-Type-Options), and more. **Required for any production Express app.** |
| `express-rate-limit` | Counts requests per IP and returns 429 Too Many Requests when exceeded. Prevents brute-force attacks on login and API scraping. |
| `bcryptjs` | Hashes passwords using the bcrypt algorithm. One-way hash with salt — even if the DB is stolen, attackers can't reverse the hash. Never store plain text passwords. |
| `jsonwebtoken` | Creates and verifies JWT tokens. Access tokens (15min) authorize API requests. Refresh tokens (7d) live in httpOnly cookies to silently re-authenticate. |
| `cors` | Tells browsers which origins are allowed to make API requests. Without CORS configuration, your React app (port 3000) can't call the API (port 5000). |

#### Database & Caching
| Package | Why it's here |
|---|---|
| `pg` | Official PostgreSQL client for Node.js. Provides connection pooling, parameterized queries (SQL injection prevention), and transaction support. |
| `ioredis` | Redis client with automatic reconnection, TypeScript support, and Lua scripting. Used for caching, rate limiting, sessions, and Bull job queues. |

#### API & Validation
| Package | Why it's here |
|---|---|
| `zod` | TypeScript-first schema validation. Define a schema once → get both runtime validation AND inferred TypeScript types. No duplication. |
| `express-async-errors` | Patches Express to automatically catch errors thrown inside async route handlers. Without it, every async handler needs a try/catch + next(error). |
| `compression` | Gzip/deflate HTTP responses. Reduces bandwidth by ~70% for JSON responses. Under 1KB responses are not compressed (overhead not worth it). |
| `cookie-parser` | Parses `Cookie` headers so `req.cookies` is available. Required for reading the httpOnly refresh token cookie. |
| `morgan` | Logs every HTTP request (method, URL, status, response time). Structured output feeds into Winston for log aggregation. |

#### File Uploads
| Package | Why it's here |
|---|---|
| `multer` | Parses `multipart/form-data` requests (file uploads). Express doesn't handle this by default. Multer makes `req.file` available with file metadata. |
| `sharp` | Server-side image processing. Compresses images, converts to WebP, resizes to multiple dimensions. Reduces storage costs and page load times. |
| `uuid` | Generates random UUIDs for file names. Prevents filename collisions and removes user-controlled names (path traversal attack prevention). |

#### Observability
| Package | Why it's here |
|---|---|
| `winston` | Structured JSON logging with levels (error/warn/info/debug), multiple transports (console + rotating files), and child loggers for request context. |
| `winston-daily-rotate-file` | Rotates log files daily, compresses old files, deletes after N days. Prevents the server disk from filling up with logs. |

#### Real-time
| Package | Why it's here |
|---|---|
| `socket.io` | WebSocket library with automatic reconnection, rooms, namespaces, and fallback to HTTP long-polling. Used for real-time chat and notifications. |

#### Background Jobs
| Package | Why it's here |
|---|---|
| `bull` | Redis-backed job queue. Moves slow operations (email sending, image processing, report generation) out of the HTTP request cycle. Supports retries, priorities, rate limiting. |
| `nodemailer` | Sends emails via SMTP. Used for email verification, password reset, and order confirmations. Works with Gmail, SendGrid, AWS SES. |

---

### Frontend Packages

| Package | Why it's here |
|---|---|
| `@reduxjs/toolkit` | Modern Redux. `createSlice` eliminates boilerplate. Immer integration means you write "mutating" code that's actually immutable. DevTools integration built-in. |
| `@tanstack/react-query` | Server state management. Handles caching, background refetching, loading/error states, and deduplication. Replaces most useEffect-for-data-fetching patterns. |
| `axios` | HTTP client with interceptors. Our interceptor silently refreshes the access token on 401 responses and retries the original request — transparent to components. |
| `react-router-dom` | Client-side routing. `lazy()` + `Suspense` for code splitting. Nested routes for layout sharing. |
| `react-hook-form` | Performant forms. Only re-renders the field that changed (not the whole form). Integrates with Zod for schema validation via `@hookform/resolvers`. |
| `zod` | Same schema library as backend. Define form validation rules once and get TypeScript types automatically. |
| `react-hot-toast` | Toast notifications. Lightweight, accessible, and easy to trigger from anywhere (`toast.success('Added to cart')`). |
| `socket.io-client` | Connects to the Socket.io server. Same API as the server — handles reconnection, auth, and event emission. |
| `lucide-react` | Icon library. Tree-shakeable SVG icons as React components. |
| `clsx` | Conditional class names utility. `clsx('btn', { 'btn-active': isActive })` — cleaner than template literals. |

---

## Day 41 — Architecture & Backend

**Duration:** 6 hours | **Goal:** Working backend with auth, products, and database

---

### Hour 1–2: Project Setup & Database

#### Step 1: Start the infrastructure

```bash
docker-compose up -d postgres redis
# Wait 10 seconds for containers to be healthy
docker-compose logs postgres  # Should say "database system is ready"
```

#### Step 2: Run migrations and verify schema

```bash
cd backend
npm run migrate

# Connect to pgAdmin at http://localhost:5050
# Server: postgres, Port: 5432, Username: postgres, Password: postgres
# You should see: users table, products table, _migrations table
```

#### Step 3: Add missing tables to migration

Open `backend/src/utils/migrate.ts` and add these migrations:

```typescript
{
  id: '004_create_categories_table',
  sql: `
    CREATE TABLE IF NOT EXISTS categories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) UNIQUE NOT NULL,
      slug VARCHAR(100) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `,
},
{
  id: '005_add_category_to_products',
  sql: `
    ALTER TABLE products 
    ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
  `,
},
{
  id: '006_create_orders_table',
  sql: `
    CREATE TABLE IF NOT EXISTS orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
      status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending','processing','shipped','delivered','cancelled')),
      total_amount NUMERIC(10,2) NOT NULL,
      shipping_address JSONB,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
  `,
},
{
  id: '007_create_order_items_table',
  sql: `
    CREATE TABLE IF NOT EXISTS order_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
      quantity INTEGER NOT NULL CHECK (quantity > 0),
      price_at_purchase NUMERIC(10,2) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
  `,
},
{
  id: '008_create_reviews_table',
  sql: `
    CREATE TABLE IF NOT EXISTS reviews (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      comment TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, product_id)
    );
    CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
  `,
},
```

Run migrations again:
```bash
npm run migrate
```

---

### Hour 3–4: Auth Controller & Service

#### Step 1: Create the User Model (Repository Pattern)

Create `backend/src/models/user.model.ts`:

```typescript
import { query, withTransaction } from '../config/database';
import { RegisterDto } from '../validators/auth.validator';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'admin';
  emailVerified: boolean;
  createdAt: Date;
}

export const UserModel = {
  findByEmail: async (email: string): Promise<User | null> => {
    const { rows } = await query<User>(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return rows[0] || null;
  },

  findById: async (id: string): Promise<User | null> => {
    const { rows } = await query<User>(
      'SELECT id, first_name, last_name, email, role, email_verified, created_at FROM users WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  },

  create: async (data: RegisterDto): Promise<User> => {
    const passwordHash = await bcrypt.hash(
      data.password,
      parseInt(process.env.BCRYPT_ROUNDS || '12')
    );
    const { rows } = await query<User>(
      `INSERT INTO users (first_name, last_name, email, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, first_name, last_name, email, role, email_verified, created_at`,
      [data.firstName, data.lastName, data.email, passwordHash]
    );
    return rows[0];
  },

  verifyPassword: async (plainText: string, hash: string): Promise<boolean> => {
    // WHY bcrypt.compare (not ===): Timing-safe comparison prevents timing attacks
    return bcrypt.compare(plainText, hash);
  },
};
```

#### Step 2: Create the Auth Service

Create `backend/src/services/auth.service.ts`:

```typescript
import { UserModel } from '../models/user.model';
import { AppError } from '../utils/AppError';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { cacheSet, cacheDel } from '../config/redis';
import type { RegisterDto, LoginDto } from '../validators/auth.validator';

export const AuthService = {
  register: async (data: RegisterDto) => {
    // Check if email already exists
    const existing = await UserModel.findByEmail(data.email);
    if (existing) {
      throw new AppError(409, 'EMAIL_TAKEN', 'An account with this email already exists');
    }

    const user = await UserModel.create(data);
    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

    // Store refresh token in Redis for revocation support
    // Key: refresh:userId, TTL: 7 days
    await cacheSet(`refresh:${user.id}`, refreshToken, 7 * 24 * 60 * 60);

    return { user, accessToken, refreshToken };
  },

  login: async (data: LoginDto) => {
    const user = await UserModel.findByEmail(data.email);
    if (!user) {
      // WHY same error for "user not found" AND "wrong password":
      // Revealing which one is true lets attackers enumerate valid emails
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const isValid = await UserModel.verifyPassword(data.password, user.passwordHash);
    if (!isValid) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password');
    }

    const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
    const refreshToken = generateRefreshToken({ userId: user.id, email: user.email, role: user.role });

    await cacheSet(`refresh:${user.id}`, refreshToken, 7 * 24 * 60 * 60);

    return { user, accessToken, refreshToken };
  },

  logout: async (userId: string) => {
    // Revoke refresh token by deleting from Redis
    await cacheDel(`refresh:${userId}`);
  },
};
```

#### Step 3: Create the Auth Controller

Create `backend/src/controllers/auth.controller.ts`:

```typescript
import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { refreshCookieOptions } from '../utils/jwt';
import type { RegisterDto, LoginDto } from '../validators/auth.validator';

export const register = async (req: Request, res: Response) => {
  const data = req.body as RegisterDto;
  const { user, accessToken, refreshToken } = await AuthService.register(data);

  // httpOnly cookie for refresh token — NOT accessible by JavaScript
  res.cookie('refreshToken', refreshToken, refreshCookieOptions);

  res.status(201).json({
    success: true,
    data: {
      user: { id: user.id, email: user.email, firstName: user.firstName, role: user.role },
      accessToken,
    },
  });
};

export const login = async (req: Request, res: Response) => {
  const data = req.body as LoginDto;
  const { user, accessToken, refreshToken } = await AuthService.login(data);

  res.cookie('refreshToken', refreshToken, refreshCookieOptions);

  res.json({
    success: true,
    data: {
      user: { id: user.id, email: user.email, firstName: user.firstName, role: user.role },
      accessToken,
    },
  });
};

export const logout = async (req: Request, res: Response) => {
  await AuthService.logout(req.user!.userId);
  res.clearCookie('refreshToken', { path: '/api/v1/auth/refresh' });
  res.json({ success: true, data: { message: 'Logged out successfully' } });
};

export const getMe = async (req: Request, res: Response) => {
  res.json({ success: true, data: { user: req.user } });
};
```

#### Step 4: Wire up the routes

Open `backend/src/routes/auth.routes.ts` and uncomment the controller imports and replace the stub handlers.

---

### Hour 5–6: Product API

#### Step 1: Create the Product Model

Create `backend/src/models/product.model.ts` with these methods:
- `findAll(filters)` — paginated list with cursor pagination + Redis caching
- `findById(id)` — single product with Redis caching
- `create(data)` — create + invalidate cache
- `update(id, data)` — update + invalidate cache
- `delete(id)` — soft delete (set `is_active = false`) + invalidate cache

#### Step 2: Implement the Product Controller

Create `backend/src/controllers/product.controller.ts` with:
- `listProducts` — GET /products with filters (search, price range, category, cursor)
- `getProduct` — GET /products/:id
- `createProduct` — POST /products (admin only)
- `updateProduct` — PATCH /products/:id (admin only)
- `deleteProduct` — DELETE /products/:id (admin only)

#### Step 3: Seed the database

Create `backend/src/utils/seed.ts` with 20 sample products across 3 categories.

```bash
npm run seed
```

#### Checklist for Day 41 end
- [ ] All 5 tables created via migrations
- [ ] `POST /api/v1/auth/register` returns 201 with user + accessToken
- [ ] `POST /api/v1/auth/login` returns 200 with user + accessToken
- [ ] `GET /api/v1/auth/me` returns current user (with token)
- [ ] `GET /api/v1/products` returns paginated list
- [ ] `POST /api/v1/products` creates product (admin token required)
- [ ] Redis caching visible in Redis CLI: `redis-cli KEYS "products:*"`
- [ ] Committed with message: `feat(backend): implement auth and product APIs`

---

## Day 42 — Frontend & Features

**Duration:** 6 hours | **Goal:** Working frontend with product listing, cart, and checkout

---

### Hour 1: Login & Register Pages

#### Step 1: Implement LoginPage

Open `frontend/src/pages/auth/LoginPage.tsx` and implement:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppDispatch, useAppSelector } from '@/store';
import { loginUser } from '@/store/slices/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoading, error } = useAppSelector((s) => s.auth);
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    const result = await dispatch(loginUser(data));
    if (loginUser.fulfilled.match(result)) {
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } else {
      toast.error(error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Sign In</h1>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input {...register('email')} type="email" className="w-full border rounded px-3 py-2" />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Password</label>
          <input {...register('password')} type="password" className="w-full border rounded px-3 py-2" />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
```

---

### Hour 2: Product Service & React Query

#### Step 1: Create the product service

Create `frontend/src/services/product.service.ts`:

```typescript
import api from './api';
import type { Product, ProductFilters, PaginatedResponse } from '@/types/auth.types';

export const productService = {
  list: async (filters: ProductFilters = {}): Promise<PaginatedResponse<Product>> => {
    const { data } = await api.get<{ data: PaginatedResponse<Product> }>('/products', {
      params: filters,
    });
    return data.data;
  },

  getById: async (id: string): Promise<Product> => {
    const { data } = await api.get<{ data: Product }>(`/products/${id}`);
    return data.data;
  },
};
```

---

### Hour 3: Product List with Infinite Scroll

Open `frontend/src/pages/products/ProductListPage.tsx` and implement:

```tsx
import { useInfiniteQuery } from '@tanstack/react-query';
import { useCallback } from 'react';
import { productService } from '@/services/product.service';
import { useDebounce, useIntersectionObserver } from '@/hooks';

export default function ProductListPage() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);  // Day 27 concept!

  // useInfiniteQuery handles cursor-based pagination
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['products', debouncedSearch],
    queryFn: ({ pageParam }) =>
      productService.list({ search: debouncedSearch, cursor: pageParam as string | undefined, limit: 12 }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined,
  });

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Intersection Observer for "load more" trigger (Day 26 concept!)
  const { ref: loadMoreRef } = useIntersectionObserver(handleLoadMore);

  const products = data?.pages.flatMap((page) => page.items) ?? [];

  if (isLoading) return <div>Loading products...</div>;

  return (
    <div>
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products..."
        className="w-full border rounded px-4 py-2 mb-6"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Invisible trigger element — loads more when scrolled into view */}
      <div ref={loadMoreRef} className="h-10 flex items-center justify-center mt-8">
        {isFetchingNextPage && <span>Loading more...</span>}
        {!hasNextPage && products.length > 0 && <span className="text-gray-400">All products loaded</span>}
      </div>
    </div>
  );
}
```

---

### Hour 4: Shopping Cart

The cart slice is already built in Redux (`cartSlice.ts`). Now build the UI:

1. **Navbar cart icon** — shows `selectCartItemCount` badge
2. **Cart sidebar/drawer** — lists items, quantities, total
3. **"Add to Cart" button** on ProductCard — dispatches `addToCart`
4. **CartPage** — full cart view with `updateQuantity` and `removeFromCart`

---

### Hour 5: Checkout Flow

Implement `CheckoutPage.tsx` as a multi-step form (Day 23 concept!):
- Step 1: Shipping address (React Hook Form + Zod)
- Step 2: Order summary review
- Step 3: Confirmation (call `POST /api/v1/orders`)

---

### Hour 6: File Upload (Product Images)

Add image upload to the admin product form using the `/api/v1/upload/image` endpoint.

#### Checklist for Day 42 end
- [ ] Login and register forms work end-to-end
- [ ] Product list loads with infinite scroll
- [ ] Debounced search filters products
- [ ] Add to cart increments badge in navbar
- [ ] Cart page shows items with correct totals
- [ ] Committed with: `feat(frontend): implement product listing and cart`

---

## Day 43 — Testing, Security & Docker

**Duration:** 6 hours | **Goal:** Tested, secured, and containerized application

---

### Hour 1–2: Backend Tests

#### Unit test example — Auth Service

Create `backend/src/services/__tests__/auth.service.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from '@jest/globals';
import { AuthService } from '../auth.service';
import { UserModel } from '../../models/user.model';
import { AppError } from '../../utils/AppError';

// Mock the UserModel so tests don't hit the real DB
vi.mock('../../models/user.model');
vi.mock('../../config/redis', () => ({
  cacheSet: vi.fn(),
  cacheDel: vi.fn(),
}));

describe('AuthService.login', () => {
  beforeEach(() => vi.clearAllMocks());

  it('throws INVALID_CREDENTIALS when user not found', async () => {
    vi.mocked(UserModel.findByEmail).mockResolvedValue(null);

    await expect(AuthService.login({ email: 'x@x.com', password: '123', rememberMe: false }))
      .rejects
      .toMatchObject({ code: 'INVALID_CREDENTIALS', statusCode: 401 });
  });

  it('throws INVALID_CREDENTIALS when password is wrong', async () => {
    vi.mocked(UserModel.findByEmail).mockResolvedValue({ ...mockUser, passwordHash: 'hash' });
    vi.mocked(UserModel.verifyPassword).mockResolvedValue(false);

    await expect(AuthService.login({ email: 'x@x.com', password: 'wrong', rememberMe: false }))
      .rejects
      .toMatchObject({ code: 'INVALID_CREDENTIALS' });
  });

  it('returns user + tokens on successful login', async () => {
    vi.mocked(UserModel.findByEmail).mockResolvedValue(mockUser);
    vi.mocked(UserModel.verifyPassword).mockResolvedValue(true);

    const result = await AuthService.login({ email: 'test@test.com', password: 'correct', rememberMe: false });

    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
    expect(result.user.email).toBe('test@test.com');
  });
});
```

#### Integration test example — Auth API

Create `backend/src/routes/__tests__/auth.routes.test.ts`:

```typescript
import request from 'supertest';
import { app } from '../../app';
import { query } from '../../config/database';

describe('POST /api/v1/auth/register', () => {
  afterEach(async () => {
    // Clean up test data
    await query("DELETE FROM users WHERE email LIKE '%@test.com'");
  });

  it('creates a new user and returns tokens', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({
        firstName: 'Test',
        lastName: 'User',
        email: 'newuser@test.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.accessToken).toBeDefined();
    expect(response.body.data.user.email).toBe('newuser@test.com');
    expect(response.body.data.user.passwordHash).toBeUndefined(); // Never expose hash!
  });

  it('returns 409 when email already exists', async () => {
    // Register once
    await request(app).post('/api/v1/auth/register')
      .send({ firstName: 'A', lastName: 'B', email: 'dup@test.com', password: 'Password123', confirmPassword: 'Password123' });

    // Register again with same email
    const response = await request(app).post('/api/v1/auth/register')
      .send({ firstName: 'A', lastName: 'B', email: 'dup@test.com', password: 'Password123', confirmPassword: 'Password123' });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe('EMAIL_TAKEN');
  });

  it('returns 422 when validation fails', async () => {
    const response = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'not-an-email', password: 'short' });

    expect(response.status).toBe(422);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
    expect(response.body.error.details).toBeInstanceOf(Array);
  });
});
```

---

### Hour 3: Frontend Tests

```tsx
// frontend/src/components/__tests__/LoginPage.test.tsx
import { render, screen, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/pages/auth/LoginPage';
import { server } from '@/test/mocks/server'; // MSW mock server
import { http, HttpResponse } from 'msw';

test('shows error toast on invalid credentials', async () => {
  server.use(
    http.post('/api/v1/auth/login', () =>
      HttpResponse.json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } }, { status: 401 })
    )
  );

  render(<LoginPage />, { initialEntries: ['/login'] });

  await userEvent.type(screen.getByLabelText(/email/i), 'wrong@test.com');
  await userEvent.type(screen.getByLabelText(/password/i), 'wrongpass');
  await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

  await waitFor(() => {
    expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
  });
});
```

---

### Hour 4: Redis Caching for Products

In your Product Model, add caching:

```typescript
findAll: async (filters: ProductFilters) => {
  const cacheKey = `products:list:${JSON.stringify(filters)}`;
  
  // Check cache first
  const cached = await cacheGet<PaginatedResponse<Product>>(cacheKey);
  if (cached) return cached;

  // Query DB
  const result = await query('SELECT ... FROM products ...');
  
  // Cache for 5 minutes
  await cacheSet(cacheKey, result, 300);
  return result;
},

// On create/update/delete:
update: async (id: string, data: Partial<Product>) => {
  const updated = await query('UPDATE products ...');
  // Invalidate ALL product cache keys
  await cacheInvalidatePattern('products:*');
  return updated;
},
```

---

### Hour 5: Docker Full Stack

```bash
# Build and start everything
docker-compose up --build

# Verify all containers are healthy
docker-compose ps

# Run migrations inside the container
docker-compose exec api npm run migrate

# View API logs
docker-compose logs -f api

# View all logs
docker-compose logs -f
```

---

### Hour 6: README and Documentation

Write a `README.md` update documenting:
1. How to run the project
2. API endpoints (use a table: Method | Endpoint | Auth | Description)
3. Environment variables
4. Architecture decisions you made (why cursor pagination, why Redis caching)
5. Known limitations and future improvements

#### Checklist for Day 43 end
- [ ] 80%+ test coverage on auth service
- [ ] Integration tests pass for register, login, product CRUD
- [ ] Frontend tests for LoginPage and at least one component
- [ ] Redis caching working (verify with `redis-cli KEYS "*"`)
- [ ] `docker-compose up` brings up all 5 services
- [ ] `docker-compose exec api npm run migrate` runs cleanly
- [ ] Committed with: `test: add unit and integration tests`
- [ ] Committed with: `chore(docker): finalize docker-compose production config`

---

## Day 44 — Presentation & Code Review

**Duration:** 6 hours | **Goal:** Present professional, production-ready work

---

### Morning: Code Review & Cleanup (2 hours)

**Self-review checklist** — go through every file you wrote:

```bash
# Find any leftover TODO stubs you didn't implement
grep -r "TODO" backend/src --include="*.ts" | grep -v "node_modules"

# Find console.log statements (remove from production code)
grep -r "console.log" backend/src frontend/src --include="*.ts" --include="*.tsx"

# Check for hardcoded values
grep -r "localhost" backend/src --include="*.ts"  # Should use env vars

# TypeScript check
cd backend && npm run typecheck
cd ../frontend && npm run typecheck

# Lint
npm run lint
```

**Performance checks:**
- Open Chrome DevTools → Performance tab → Record a page load
- Check Network tab: are responses gzipped? (Content-Encoding: gzip)
- Run Lighthouse audit (DevTools → Lighthouse → Generate report)
- Target: Performance > 80, Accessibility > 90, Best Practices > 90

---

### Midday: Presentation Prep (2 hours)

Your presentation should cover (15-20 minutes):

**1. Live Demo** (5 min)
- Register a new account
- Browse products with search
- Add items to cart
- Complete checkout
- Show admin product creation

**2. Architecture Overview** (5 min)
Draw or describe the request flow:
```
Browser → React → Axios (with interceptor) → Express → Middleware chain
→ Controller → Service → PostgreSQL / Redis → Response
```

**3. Key Technical Decisions** (5 min)
- Why cursor pagination over offset pagination
- Why Redis for caching (show the performance difference with/without cache)
- Why httpOnly cookies for refresh tokens (XSS protection)
- How error handling works end-to-end

**4. Challenges & Solutions** (3 min)
- What was the hardest problem you faced?
- How did you debug it?
- What would you improve with more time?

**5. Metrics** (2 min)
- Test coverage percentage
- Lighthouse scores
- API response times (from logs)

---

### Afternoon: Technical Blog Post (2 hours)

Write a Markdown blog post in `docs/TECHNICAL_BLOG.md`:

**Required sections:**
1. **Introduction** — What you built and why this stack
2. **Architecture** — Diagram or description of the system
3. **Interesting Problems** — 3 technical challenges you solved (with code snippets)
4. **Security Decisions** — How you secured the application (jwt, rate limiting, helmet)
5. **Performance Optimizations** — Caching strategy, code splitting, lazy loading
6. **Testing Strategy** — What you tested and why
7. **Lessons Learned** — What you'd do differently
8. **Next Steps** — If you had 2 more weeks, what would you add?

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | Yes | `development` | `development`, `production`, `test` |
| `PORT` | No | `5000` | Server port |
| `DB_HOST` | Yes | `localhost` | PostgreSQL host |
| `DB_PORT` | No | `5432` | PostgreSQL port |
| `DB_NAME` | Yes | `mern_db` | Database name |
| `DB_USER` | Yes | `postgres` | DB username |
| `DB_PASSWORD` | Yes | — | DB password |
| `REDIS_HOST` | Yes | `localhost` | Redis host |
| `REDIS_PORT` | No | `6379` | Redis port |
| `JWT_ACCESS_SECRET` | Yes | — | Min 32 chars. Unique per environment. |
| `JWT_REFRESH_SECRET` | Yes | — | Min 32 chars. Different from access secret. |
| `JWT_ACCESS_EXPIRES_IN` | No | `15m` | Access token TTL |
| `JWT_REFRESH_EXPIRES_IN` | No | `7d` | Refresh token TTL |
| `BCRYPT_ROUNDS` | No | `12` | Hashing rounds (10-14) |
| `RATE_LIMIT_MAX_REQUESTS` | No | `100` | Max requests per 15min window |
| `UPLOAD_MAX_SIZE_MB` | No | `10` | Max upload size |
| `LOG_LEVEL` | No | `debug` | `error`, `warn`, `info`, `debug` |

### Frontend (`frontend/.env.local`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | No | `/api/v1` | API base URL. Use `/api/v1` with Vite proxy. |
| `VITE_WS_URL` | No | — | Socket.io server URL |
| `VITE_APP_NAME` | No | `MERN App` | App title |

---

## API Response Format

All API responses follow this envelope format:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "MACHINE_READABLE_CODE",
    "message": "Human readable message",
    "details": [{ "field": "email", "message": "Invalid email" }]
  }
}
```

**Common error codes:**

| Code | HTTP Status | Description |
|---|---|---|
| `VALIDATION_ERROR` | 422 | Request body failed Zod validation |
| `UNAUTHORIZED` | 401 | No token or token not provided |
| `INVALID_TOKEN` | 401 | Token is expired or malformed |
| `FORBIDDEN` | 403 | Valid token but insufficient role |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `CONFLICT` | 409 | Duplicate (e.g., email already taken) |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_SERVER_ERROR` | 500 | Bug on our side |

---

## Git Workflow

```bash
# Start a new feature
git checkout dev && git pull origin dev
git checkout -b feature/your-feature-name

# Commit often with good messages
git add .
git commit -m "feat(products): add cursor pagination to product listing"
# Husky runs: ESLint → Prettier → commit message check

# Push and open PR
git push -u origin feature/your-feature-name
# Go to GitHub → Open PR → base: dev → fill in template → request review

# After PR is merged, clean up
git checkout dev && git pull origin dev
git branch -d feature/your-feature-name
```

**Never:**
- `git push --force` to dev/staging/main
- Commit directly to dev/staging/main
- Skip the PR template
- Merge your own PR without a review

---

## Troubleshooting

**Docker containers fail to start:**
```bash
docker-compose down -v          # Remove containers AND volumes
docker-compose up --build       # Rebuild from scratch
```

**Postgres connection refused:**
```bash
docker-compose ps               # Check if postgres container is healthy
docker-compose logs postgres    # Look for startup errors
```

**`npm run migrate` fails — "relation does not exist":**
```bash
# Connect to DB and check what exists
docker-compose exec postgres psql -U postgres -d mern_db -c "\dt"
# If empty, migrations haven't run yet
docker-compose exec api npm run migrate
```

**Husky hooks not running:**
```bash
# From project root
npm run prepare           # Reinstalls husky
chmod +x .husky/pre-commit .husky/commit-msg .husky/pre-push
```

**TypeScript errors after pulling from dev:**
```bash
cd backend && npm ci    # Install any new packages
cd ../frontend && npm ci
```

**Redis `ECONNREFUSED`:**
```bash
# Check if Redis is running
docker-compose ps redis
# Or if running locally:
redis-cli ping   # Should return PONG
```

**"Cannot find module '@/components/...'":**
```bash
# Vite alias not resolving — check vite.config.ts paths match tsconfig paths
# Both must have: '@/*': ['src/*']
```

---

> Built for the MERN Internship Training Program.  
> See `docs/GITHUB_SETUP.md` for repository configuration.

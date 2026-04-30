# MERN E-Commerce

Full-stack e-commerce starter built with React, Express, PostgreSQL, Redis, and TypeScript. This repository is currently optimized for secure local development, CI verification, and fast onboarding rather than full feature completeness.

## What You Get

- Backend security middleware with `helmet`, custom headers, and route-level rate limiting
- React frontend with route guards, Redux Toolkit, React Query, and Vite
- GitHub Actions CI for linting, type checking, backend tests, and frontend tests
- Docker Compose for local infrastructure
- Clear docs for current endpoints, environment variables, and known out-of-scope areas

## Run In 3 Steps

1. Install dependencies.

```bash
npm install
npm install --prefix backend
npm install --prefix frontend
```

2. Copy the environment files.

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Start the app.

```bash
npm run dev
```

Backend runs on `http://localhost:5000` and frontend runs on Vite's default local port.

## Architecture

```text
+-------------------+      HTTP / JSON       +----------------------+
| React + Vite SPA  | <--------------------> | Express API          |
| Redux + Query     |                        | Security middleware  |
+-------------------+                        | Route handlers       |
         |                                   +----+------------+----+
         | WebSocket-ready hooks                  |            |
         |                                        |            |
         v                                        v            v
+-------------------+                  +----------------+  +-------------------+
| Browser storage   |                  | PostgreSQL     |  | Redis             |
| Cookies / client  |                  | app data       |  | cache + rate limit|
+-------------------+                  +----------------+  +-------------------+
```

## Local Verification

Run the same core checks used by CI:

```bash
npm run lint
npm run typecheck
npm run test
```

Security verification commands:

```bash
curl -I http://localhost:5000/api/v1/products
bash scripts/rate-limit-test.sh
```

To verify auth rate limiting, send six failed login attempts and confirm the sixth returns `429`.

## API Endpoint Table

| Method | Route                           | Auth                           | Description                                                                  |
| ------ | ------------------------------- | ------------------------------ | ---------------------------------------------------------------------------- |
| GET    | `/api/health`                   | Public                         | Liveness check for process status                                            |
| GET    | `/api/health/ready`             | Public                         | Readiness check for PostgreSQL and Redis                                     |
| POST   | `/api/v1/auth/register`         | Public                         | Validate input, apply auth rate limit, currently returns `501`               |
| POST   | `/api/v1/auth/login`            | Public                         | Validate input, apply auth rate limit, currently returns `501`               |
| POST   | `/api/v1/auth/refresh`          | Public                         | Refresh-token exchange placeholder, currently returns `501`                  |
| POST   | `/api/v1/auth/logout`           | Bearer token                   | Logout placeholder, currently returns `501`                                  |
| POST   | `/api/v1/auth/forgot-password`  | Public                         | Validate input, apply password-reset rate limit, currently returns `501`     |
| POST   | `/api/v1/auth/reset-password`   | Public                         | Validate input and reset placeholder, currently returns `501`                |
| GET    | `/api/v1/auth/me`               | Bearer token                   | Returns authenticated user payload placeholder                               |
| GET    | `/api/v1/users/profile`         | Bearer token                   | Current user profile placeholder, currently returns `501`                    |
| PATCH  | `/api/v1/users/profile`         | Bearer token                   | Update profile placeholder, currently returns `501`                          |
| PATCH  | `/api/v1/users/change-password` | Bearer token                   | Change password placeholder, currently returns `501`                         |
| GET    | `/api/v1/users`                 | Admin bearer token             | List users placeholder, currently returns `501`                              |
| DELETE | `/api/v1/users/:id`             | Admin bearer token             | Delete user placeholder, currently returns `501`                             |
| GET    | `/api/v1/products`              | Public / optional bearer token | Product list placeholder, rate-limited under `/api`, currently returns `501` |
| GET    | `/api/v1/products/:id`          | Public / optional bearer token | Product detail placeholder, currently returns `501`                          |
| POST   | `/api/v1/products`              | Admin bearer token             | Create product placeholder, currently returns `501`                          |
| PATCH  | `/api/v1/products/:id`          | Admin bearer token             | Update product placeholder, currently returns `501`                          |
| DELETE | `/api/v1/products/:id`          | Admin bearer token             | Delete product placeholder, currently returns `501`                          |
| POST   | `/api/v1/upload/image`          | Bearer token                   | Single-image upload placeholder, currently returns `501`                     |
| POST   | `/api/v1/upload/images`         | Bearer token                   | Multi-image upload placeholder, currently returns `501`                      |

Full request and response examples live in [docs/API.md](/home/manush/Desktop/Manush/mern-ecommerce/docs/API.md).

## Environment Variables

### Backend

| Variable                  | Required | Description                                          |
| ------------------------- | -------- | ---------------------------------------------------- |
| `NODE_ENV`                | Yes      | Runtime mode: `development`, `test`, or `production` |
| `PORT`                    | Yes      | Express server port                                  |
| `API_VERSION`             | Yes      | API prefix version, defaults to `v1`                 |
| `FRONTEND_URL`            | Yes      | Allowed CORS origin                                  |
| `DB_HOST`                 | Yes      | PostgreSQL host                                      |
| `DB_PORT`                 | Yes      | PostgreSQL port                                      |
| `DB_NAME`                 | Yes      | PostgreSQL database name                             |
| `DB_USER`                 | Yes      | PostgreSQL user                                      |
| `DB_PASSWORD`             | Yes      | PostgreSQL password                                  |
| `DB_POOL_MIN`             | No       | Minimum DB pool size                                 |
| `DB_POOL_MAX`             | No       | Maximum DB pool size                                 |
| `REDIS_HOST`              | Yes      | Redis host                                           |
| `REDIS_PORT`              | Yes      | Redis port                                           |
| `REDIS_PASSWORD`          | No       | Redis password if enabled                            |
| `REDIS_TTL`               | No       | Default cache TTL in seconds                         |
| `JWT_ACCESS_SECRET`       | Yes      | Access token signing secret                          |
| `JWT_REFRESH_SECRET`      | Yes      | Refresh token signing secret                         |
| `JWT_ACCESS_EXPIRES_IN`   | No       | Access token lifetime                                |
| `JWT_REFRESH_EXPIRES_IN`  | No       | Refresh token lifetime                               |
| `SMTP_HOST`               | No       | SMTP host for email flows                            |
| `SMTP_PORT`               | No       | SMTP port                                            |
| `SMTP_USER`               | No       | SMTP username                                        |
| `SMTP_PASS`               | No       | SMTP password                                        |
| `EMAIL_FROM`              | No       | From-address for outgoing mail                       |
| `UPLOAD_MAX_SIZE_MB`      | No       | Upload size limit in MB                              |
| `UPLOAD_DIR`              | No       | Local upload directory                               |
| `RATE_LIMIT_WINDOW_MS`    | No       | Global rate-limit window in milliseconds             |
| `RATE_LIMIT_MAX_REQUESTS` | No       | Max requests per IP in the window                    |
| `BCRYPT_ROUNDS`           | No       | Password hashing rounds                              |
| `COOKIE_SECRET`           | Yes      | Signed-cookie secret                                 |
| `LOG_LEVEL`               | No       | Winston logging level                                |

### Frontend

| Variable        | Required | Description                        |
| --------------- | -------- | ---------------------------------- |
| `VITE_API_URL`  | Yes      | Base URL for API requests          |
| `VITE_WS_URL`   | Yes      | Base URL for WebSocket connections |
| `VITE_APP_NAME` | No       | Display name for the frontend      |

## Troubleshooting

| Problem                                        | What to check                                                                                                                                            |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend will not start                         | Confirm PostgreSQL and Redis are running and `backend/.env` values are valid                                                                             |
| Frontend cannot reach API                      | Verify `VITE_API_URL` points to `http://localhost:5000/api/v1` and backend CORS `FRONTEND_URL` matches the frontend origin                               |
| `429 Too Many Requests` appears during testing | Wait for the configured rate-limit window to expire or temporarily restart the backend while testing locally                                             |
| Typecheck fails on placeholder pages           | Re-run `npm run typecheck` after pulling latest changes; the realtime preview page is intentionally simplified to avoid missing shared-component imports |
| Upload endpoints return `501`                  | Upload storage processing is not implemented yet and is documented as out of scope                                                                       |
| Tests show no suites                           | Current CI validates the pipelines and placeholders; add app-specific tests as feature work expands                                                      |

## Out Of Scope

The following items are out of scope for this hardening pass:

- Multi-image upload completion and broader upload/storage pipeline polish
- Database/schema expansion beyond the current setup
- Socket event handlers in [`backend/src/config/socket.ts`](/home/manush/Desktop/Manush/mern-ecommerce/backend/src/config/socket.ts), including richer real-time event flows
- Deployment workflow TODO steps in `.github/workflows/deploy.yml`

## CI Notes

The pull request target branch is `dev`. A completion-ready PR should include:

- Screenshot of `curl -I http://localhost:5000/api/v1/products` showing the required security headers
- Screenshot of a green GitHub Actions run for `Lint`, `TypeCheck`, `Test-Backend`, and `Test-Frontend`
- Optional command output snippets for rate-limit and auth-limit verification

## Branch Strategy & Feature Work

- **`main`**: Production-ready baseline with security hardening complete; all TODO stubs explicitly documented as out of scope
- **`staging`**: Pre-production validation branch
- **`dev`**: Primary development target; feature branches merge here first
- **Feature branches** (e.g., `feat/pages`, `feat/product-detail-admin-form`, `feature/auth-system`, `feature/product-api`): Individual feature implementations addressing specific TODO items; these branches serve as reference implementations and integration points

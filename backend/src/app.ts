/**
 * ============================================================
 * Express Application — src/app.ts
 * ============================================================
 * All middleware and routes are registered here.
 * ORDER MATTERS — middleware is applied top-to-bottom.
 *
 * Middleware execution order:
 *   1. Security headers (helmet)         ← must be first
 *   2. CORS                              ← before body parsers
 *   3. Request logging (morgan)          ← log every request
 *   4. Body parsers                      ← parse request body
 *   5. Cookie parser                     ← parse cookies
 *   6. Compression                       ← compress responses
 *   7. Rate limiting                     ← throttle abuse
 *   8. Routes                            ← business logic
 *   9. 404 handler                       ← catch unknown routes
 *  10. Global error handler              ← must be LAST
 * ============================================================
 */

import express, { Application, Request } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import fs from 'node:fs';
import path from 'node:path';

import { securityHeaders } from './middleware/security/headers';
import { globalRateLimiter } from './middleware/security/rateLimiter';
import { requestLogger } from './middleware/logging/requestLogger';
import { correlationId } from './middleware/logging/correlationId';
import { errorHandler } from './middleware/error/errorHandler';
import { notFoundHandler } from './middleware/error/notFoundHandler';

// Route imports — add your feature routes here
import { authRouter } from './routes/auth.routes';
import { userRouter } from './routes/user.routes';
import { productRouter } from './routes/product.routes';
import { uploadRouter } from './routes/upload.routes';
import { healthRouter } from './routes/health.routes';

export const app: Application = express();
const UPLOAD_ROOT = path.resolve(process.cwd(), 'uploads');
const UPLOAD_IMAGES_DIR = path.join(UPLOAD_ROOT, 'images');

if (!fs.existsSync(UPLOAD_IMAGES_DIR)) {
  fs.mkdirSync(UPLOAD_IMAGES_DIR, { recursive: true });
}

// ─── 1. Security Headers ────────────────────────────────────
// helmet() sets ~14 HTTP headers that protect against common web vulnerabilities.
// WHY helmet: Prevents clickjacking (X-Frame-Options), XSS (CSP) ,
// sniffing attacks (X-Content-Type-Options), and more — in one line.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false, // Disable if using embedded content
  })
);

// Custom additional security headers beyond what helmet provides
app.use(securityHeaders);

// ─── 2. CORS ────────────────────────────────────────────────
// WHY CORS: Browsers block cross-origin requests by default.
// We explicitly allow our frontend origin and restrict HTTP methods.
// In production, NEVER use '*' — always specify exact origins.
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true, // Allow cookies to be sent cross-origin
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Correlation-ID'],
    exposedHeaders: ['X-Correlation-ID', 'X-RateLimit-Remaining'],
  })
);

// ─── 3. Correlation ID ──────────────────────────────────────
// WHY: Assigns a unique ID to every request so you can trace a
// single request across multiple log lines and services.
app.use(correlationId);

// ─── 4. Request Logging ─────────────────────────────────────
// WHY morgan: Logs HTTP method, URL, status, response time for every request.
// 'combined' format matches Apache/Nginx logs — familiar to DevOps teams.
// We skip health checks to avoid log noise.
app.use(
  morgan('combined', {
    skip: (req: Request) => req.url === '/api/health',
    stream: { write: (message: string) => requestLogger.http(message.trim()) },
  })
);

// ─── 5. Body Parsers ────────────────────────────────────────
// WHY json limit: Prevents large payload attacks (1MB is generous for JSON APIs).
// WHY urlencoded: Handles HTML form submissions.
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// ─── 6. Cookie Parser ───────────────────────────────────────
// WHY: Required to read httpOnly cookies (used for refresh tokens).
// httpOnly cookies are inaccessible to JavaScript — protection against XSS.
app.use(cookieParser(process.env.COOKIE_SECRET));

// ─── 7. Compression ─────────────────────────────────────────
// WHY compression: Gzip/deflate responses — reduces bandwidth by ~70%.
// Threshold of 1KB means small responses are not compressed (not worth overhead).
app.use(compression({ threshold: 1024 }));
app.use('/uploads', express.static(UPLOAD_ROOT));

// ─── 8. Global Rate Limiter ─────────────────────────────────
// WHY: Prevents brute-force attacks and API abuse. Redis-backed so
// limits work across multiple Node.js processes/instances.
app.use('/api', globalRateLimiter);

// ─── 9. Routes ──────────────────────────────────────────────
const API_PREFIX = `/api/${process.env.API_VERSION || 'v1'}`;

app.use('/api/health', healthRouter); // Health check (no version prefix)
app.use(`${API_PREFIX}/auth`, authRouter); // Registration, login, refresh, logout
app.use(`${API_PREFIX}/users`, userRouter); // User CRUD (protected)
app.use(`${API_PREFIX}/products`, productRouter); // Product CRUD (Day 41-43 feature)
app.use(`${API_PREFIX}/upload`, uploadRouter); // File uploads via Multer

// ─── 10. 404 Handler ────────────────────────────────────────
// Catches requests to routes that don't exist
app.use(notFoundHandler);

// ─── 11. Global Error Handler ───────────────────────────────
// WHY last: Express identifies error handlers by 4 parameters (err, req, res, next).
// It MUST be registered after all routes and other middleware.
app.use(errorHandler);

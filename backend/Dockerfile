# ============================================================
# Backend Dockerfile — Production (Multi-Stage Build)
# ============================================================
# WHY multi-stage for production:
#   Final image contains ONLY the compiled JS + prod dependencies.
#   No TypeScript compiler, no source maps (security), no devDeps.
#   Result: ~200MB image vs ~600MB if everything was included.
#
# WHY non-root user:
#   Running as root inside a container = root outside if container escapes.
#   Security best practice: create a dedicated non-root user.
# ============================================================

# Stage 1: Install all deps + compile TypeScript
FROM node:20-alpine AS builder
WORKDIR /app
COPY backend/package*.json backend/tsconfig.json ./
RUN npm ci

# Copy seed-data.json for build (needed by src/utils/seed.ts)
# Keep it at /docs so the existing relative import resolves in Docker
RUN mkdir -p /docs
COPY docs/seed-data.json /docs/seed-data.json
COPY backend/src ./src
RUN npm run build

# Stage 2: Install only production deps
FROM node:20-alpine AS prod-deps
WORKDIR /app

COPY backend/package*.json ./
RUN npm ci --omit=dev

# Stage 3: Final lean image
FROM node:20-alpine AS production
WORKDIR /app

# Create non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copy compiled JS and prod node_modules
COPY --from=builder /app/dist ./dist
COPY --from=prod-deps /app/node_modules ./node_modules
COPY backend/package*.json ./


# Create uploads directory with correct ownership
RUN mkdir -p uploads && chown -R appuser:appgroup /app

USER appuser

EXPOSE 5000

# Use node directly (not npm) — faster startup, proper signal handling
CMD ["node", "dist/index.js"]

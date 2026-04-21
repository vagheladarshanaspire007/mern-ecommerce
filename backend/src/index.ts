/**
 * ============================================================
 * Entry Point — src/index.ts
 * ============================================================
 * This is where the HTTP server is created and started.
 * We separate the Express `app` (src/app.ts) from the server
 * so that tests can import `app` without binding to a port.
 *
 * Pattern:
 *   index.ts  → creates HTTP server, attaches Socket.io, starts listening
 *   app.ts    → configures Express middleware and routes
 * ============================================================
 */

import 'dotenv/config';                  // Load .env FIRST before any other import
import 'express-async-errors';           // Patches Express to catch async errors automatically
import http from 'http';
import { app } from './app';
import { initSocketIO } from './config/socket';
import { connectRedis } from './config/redis';
import { connectDB } from './config/database';
import { logger } from './utils/logger';

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    // 1. Connect to PostgreSQL
    await connectDB();
    logger.info('✅ PostgreSQL connected');

    // 2. Connect to Redis
    await connectRedis();
    logger.info('✅ Redis connected');

    // 3. Create HTTP server (wrapping Express app)
    const server = http.createServer(app);

    // 4. Attach Socket.io to the HTTP server
    //    WHY: Socket.io needs access to the raw HTTP server to handle WebSocket upgrades
    initSocketIO(server);
    logger.info('✅ Socket.io initialized');

    // 5. Start listening
    server.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV}]`);
    });

    // 6. Graceful shutdown — handle SIGTERM (Docker stop, Kubernetes pod eviction)
    //    WHY: Abrupt shutdown drops in-flight requests. We finish them first.
    const shutdown = async (signal: string) => {
      logger.warn(`Received ${signal}. Graceful shutdown initiated...`);
      server.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
      // Force exit after 10s if not closed cleanly
      setTimeout(() => process.exit(1), 10_000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error('Fatal error during bootstrap:', error);
    process.exit(1);
  }
}

bootstrap();

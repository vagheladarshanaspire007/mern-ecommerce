/**
 * ============================================================
 * Socket.io Configuration — src/config/socket.ts
 * ============================================================
 * WHY Socket.io over raw WebSockets:
 *   - Automatic reconnection with exponential backoff
 *   - Rooms and namespaces (group users easily)
 *   - Fallback to HTTP long-polling when WS is blocked
 *   - Built-in acknowledgements (RPC-style)
 *   - Works with load balancers via Redis adapter
 *
 * WHY Redis adapter (for production):
 *   Without it, events only reach users connected to the SAME
 *   Node.js process. With clustering (Day 19), you need Redis
 *   Pub/Sub to broadcast across all instances.
 *   → Uncomment the Redis adapter section when you add clustering.
 * ============================================================
 */

import { Server as HTTPServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { logger } from '../utils/logger';
import { verifyAccessToken } from '../utils/jwt';

let io: SocketServer;

export const initSocketIO = (server: HTTPServer): SocketServer => {
  io = new SocketServer(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
    },
    pingTimeout: 60_000, // How long to wait for pong before disconnecting
    pingInterval: 25_000, // How often to send ping
    maxHttpBufferSize: 1e6, // 1MB max message size
  });

  // ─── Authentication Middleware ───────────────────────────
  // WHY: Authenticate on connection, not per-event.
  //      Extract user from JWT token passed in handshake.
  io.use((socket, next) => {
    const token = socket.handshake.auth.token as string;
    if (!token) return next(new Error('Authentication required'));

    const decoded = verifyAccessToken(token);
    if (!decoded) return next(new Error('Invalid token'));

    // Attach user to socket for use in event handlers
    (socket as SocketWithUser).user = decoded;
    next();
  });

  // ─── Connection Handler ──────────────────────────────────
  io.on('connection', (socket) => {
    const user = (socket as SocketWithUser).user;
    logger.info(`Socket connected: ${socket.id} | User: ${user?.userId}`);

    // Join user's personal room for targeted messages
    // WHY: Allows sending events to specific users: io.to(`user:${userId}`).emit(...)
    Promise.resolve(socket.join(`user:${user.userId}`)).catch((error: unknown) => {
      logger.error(`Failed to join socket room for user ${user.userId}:`, error);
    });

    // ── Room Management ──────────────────────────────────
    // TODO (Day 18): Add chat room join/leave handlers here
    // socket.on('room:join', (roomId: string) => { ... });
    // socket.on('room:leave', (roomId: string) => { ... });

    // ── Chat Events ──────────────────────────────────────
    // TODO (Day 18): Add message send/receive handlers here
    // socket.on('message:send', (data) => { ... });

    // ── Cleanup ──────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: ${socket.id} | Reason: ${reason}`);
      // WHY: Clean up any resources tied to this socket (e.g., presence tracking)
    });

    // ── Error Handling ───────────────────────────────────
    socket.on('error', (error) => {
      logger.error(`Socket error for ${socket.id}:`, error);
    });
  });

  logger.info('Socket.io initialized');
  return io;
};

export const getIO = (): SocketServer => {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
};

// Type augmentation for socket with user
interface DecodedUser {
  userId: string;
  email: string;
  role: string;
}

interface SocketWithUser extends Socket {
  user: DecodedUser;
}

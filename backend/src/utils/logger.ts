/**
 * ============================================================
 * Logger — src/utils/logger.ts
 * ============================================================
 * WHY Winston over console.log:
 *   - Log levels (error, warn, info, debug) — filter by severity
 *   - Structured JSON output — parseable by log aggregators (Datadog, ELK)
 *   - Multiple transports — console + file simultaneously
 *   - Log rotation — prevents disk from filling up
 *   - Correlation ID support — trace requests across services
 *
 * WHY structured logging (JSON):
 *   Raw strings are hard to query. JSON lets you filter:
 *   "Show me all errors from userId X in the last hour"
 *
 * WHY not log PII (email, passwords, tokens) in production:
 *   Logs are often stored in third-party services (Datadog, Splunk).
 *   PII in logs = GDPR violation and security risk.
 * ============================================================
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

const LOG_DIR = 'logs';
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const formatLogValue = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (value instanceof Error) return value.stack ?? value.message;
  return JSON.stringify(value) ?? String(value);
};

// ─── Custom Format ───────────────────────────────────────────
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }), // Include stack traces
  winston.format.json() // Structured output
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${formatLogValue(timestamp)}] ${formatLogValue(level)}: ${formatLogValue(message)}${metaStr}`;
  })
);

// ─── Transports ──────────────────────────────────────────────
const transports: winston.transport[] = [
  // Console — colored output for development
  new winston.transports.Console({
    format: consoleFormat,
    silent: process.env.NODE_ENV === 'test', // No console noise during tests
  }),
];

if (process.env.NODE_ENV !== 'test') {
  // WHY DailyRotateFile: Splits logs by date, compresses old files,
  // deletes files older than 14 days → prevents disk exhaustion
  transports.push(
    new DailyRotateFile({
      filename: path.join(LOG_DIR, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m', // Rotate when file hits 20MB
      maxFiles: '14d', // Keep 14 days of error logs
      zippedArchive: true,
      format: logFormat,
    }),
    new DailyRotateFile({
      filename: path.join(LOG_DIR, 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '50m',
      maxFiles: '7d', // Keep 7 days of combined logs
      zippedArchive: true,
      format: logFormat,
    })
  );
}

// ─── Logger Instance ─────────────────────────────────────────
export const logger = winston.createLogger({
  level: LOG_LEVEL,
  transports,
  // Don't exit on handled exceptions
  exitOnError: false,
});

// Separate logger for HTTP requests (used by morgan)
export const requestLogger = winston.createLogger({
  level: 'http',
  levels: { ...winston.config.npm.levels, http: 5 },
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
      silent: process.env.NODE_ENV === 'test',
    }),
  ],
});

/**
 * Create a child logger with persistent context.
 * WHY: Attach userId, correlationId to all logs within a request.
 *
 * @example
 *   const log = createContextLogger({ userId, correlationId });
 *   log.info('Order created', { orderId });
 *   // → { userId, correlationId, orderId, message: 'Order created' }
 */
export const createContextLogger = (context: Record<string, unknown>) => logger.child(context);

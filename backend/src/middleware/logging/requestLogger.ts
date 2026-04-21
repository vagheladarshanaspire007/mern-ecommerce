/**
 * Request Logger — src/middleware/logging/requestLogger.ts
 * Re-exports the winston http logger used by morgan stream.
 */
import winston from 'winston';

export const requestLogger = winston.createLogger({
  level: 'http',
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
      silent: process.env.NODE_ENV === 'test',
    }),
  ],
});

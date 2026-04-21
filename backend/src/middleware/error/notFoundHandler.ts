/**
 * 404 Not Found Handler — src/middleware/error/notFoundHandler.ts
 * Catches requests to undefined routes and returns a clean 404.
 */
import { Request, Response } from 'express';

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.url} not found`,
    },
  });
};

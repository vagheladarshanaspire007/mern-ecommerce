/**
 * ============================================================
 * Request Validation Middleware — src/middleware/validation/validateRequest.ts
 * ============================================================
 * WHY Zod for validation:
 *   - TypeScript-first: infer types from schemas (no duplication)
 *   - Runtime + compile-time safety
 *   - Rich error messages with field paths
 *   - Transforms data (trim strings, parse dates, etc.)
 *
 * WHY validate at the route level, not inside controllers:
 *   Controllers should receive clean, typed data.
 *   Validation is an infrastructure concern, not business logic.
 *
 * IMPORTANT: Zod validation errors are caught by the global
 *   error handler (ZodError check in errorHandler.ts).
 * ============================================================
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

type ValidationTarget = 'body' | 'params' | 'query';
type ValidatedRequest = Omit<Request, ValidationTarget> & Record<ValidationTarget, unknown>;

/**
 * Creates validation middleware for the specified target (body/params/query).
 * On success, replaces the target with the parsed (and transformed) data.
 * On failure, throws ZodError — caught by globalErrorHandler.
 *
 * @example
 *   router.post('/users', validateRequest(createUserSchema), createUser)
 *   router.get('/users/:id', validateRequest(idParamSchema, 'params'), getUser)
 */
export const validateRequest =
  <TOutput>(schema: ZodSchema<TOutput>, target: ValidationTarget = 'body') =>
  (req: Request, _res: Response, next: NextFunction): void => {
    const validatedReq = req as ValidatedRequest;
    // parse() throws ZodError on failure — express-async-errors forwards it to errorHandler
    const parsed = schema.parse(validatedReq[target]);
    // Replace with parsed data — Zod strips unknown fields (security)
    validatedReq[target] = parsed;
    next();
  };

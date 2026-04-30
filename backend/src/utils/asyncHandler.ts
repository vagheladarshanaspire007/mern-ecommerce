import { Request, Response, NextFunction } from 'express';

export const asyncHandler =
  <TReq = Request, TRes = Response>(fn: (req: TReq, res: TRes) => Promise<void>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    fn(req as TReq, res as TRes).catch((err: unknown) => {
      next(err instanceof Error ? err : new Error('Unknown error'));
    });
  };

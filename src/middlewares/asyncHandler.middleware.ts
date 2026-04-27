import type { NextFunction, Request, Response } from 'express';

export const tryCatch = <T extends Request>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  fn: (req: T, res: Response, next: NextFunction) => Promise<any>,
) => {
  return (req: T, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

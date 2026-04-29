import type { AuthRequest } from '@/types';
import { verifyAccessToken } from '@/utils';
import { AppError } from '@beautinique/be-classes';
import type { TRole } from '@beautinique/be-constants';
import type { NextFunction, Response } from 'express';

export const authenticate = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  const token = req.cookies?.accessToken;

  console.log('req.cookies', req.cookies);

  if (!token) {
    throw new AppError({
      message: 'Access token missing',
      statusCode: 401,
      code: 'AUTH_ERROR',
    });
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;

    next();
  } catch {
    throw new AppError({
      message: 'Invalid or expired token',
      statusCode: 401,
      code: 'AUTH_ERROR',
    });
  }
};

export const authorize =
  (allowedRoles: TRole[]) => (req: AuthRequest, _res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user || !user.role) {
      throw new AppError({
        message: 'Unauthorized',
        statusCode: 401,
        code: 'AUTH_ERROR',
      });
    }

    if (!allowedRoles.includes(user.role)) {
      throw new AppError({
        message: 'Forbidden',
        statusCode: 403,
        code: 'AUTH_ERROR',
      });
    }

    next();
  };

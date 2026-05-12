import { AppError } from '@beautinique/be-classes';
import type { TRole } from '@beautinique/be-constants';
import type { NextFunction, Response } from 'express';
import { COOKIES_DATA } from '../constants';
import type { AuthRequest } from '../types';
import { verifyAccessToken } from '../utils';

export const authenticate = async (req: AuthRequest, _res: Response, next: NextFunction) => {
  const token = req.cookies?.[COOKIES_DATA.access_token.name];

  if (!token) {
    throw new AppError({ message: 'Access token missing', code: 'AUTHENTICATION_ERROR' });
  }

  try {
    const decoded = verifyAccessToken(token);

    req.user = decoded;

    next();
  } catch (err) {
    if (err instanceof AppError) return next(err);

    return next(
      new AppError({
        message: err instanceof Error ? err.message : 'Something went wrong',
        code: 'INTERNAL_SERVER_ERROR',
      }),
    );
  }
};

export const authorize =
  (allowedRoles: TRole[]) => (req: AuthRequest, _res: Response, next: NextFunction) => {
    try {
      const token = req.cookies?.[COOKIES_DATA.access_token.name];

      if (!token) {
        throw new AppError({ message: 'Access token missing', code: 'AUTHENTICATION_ERROR' });
      }

      const decoded = verifyAccessToken(token);

      const isMaster = decoded.role === 'MASTER';
      const hasAccess = allowedRoles.includes(decoded.role);

      if (!hasAccess && !isMaster) {
        throw new AppError({
          message: 'You are not authorized to perform this action',
          code: 'AUTHORIZATION_ERROR',
        });
      }

      req.user = decoded;

      next();
    } catch (err) {
      if (err instanceof AppError) return next(err);

      return next(
        new AppError({
          message: err instanceof Error ? err.message : 'Something went wrong',
          code: 'INTERNAL_SERVER_ERROR',
        }),
      );
    }
  };

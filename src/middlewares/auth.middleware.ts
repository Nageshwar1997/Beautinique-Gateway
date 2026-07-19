import { AppError } from '@beautinique/be-classes';
import type { TRole } from '@beautinique/be-constants';
import { USER_ROLE_MAP } from '@beautinique/shared-constants';
import type { NextFunction, Request, Response } from 'express';

import { COOKIES_DATA } from '../constants/index.js';
import { verifyAccessToken } from '../utils/index.js';

// eslint-disable-next-line @typescript-eslint/require-await
export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies[COOKIES_DATA.access_token.name] as string | undefined;

  if (!token) {
    throw new AppError({ message: 'Access token missing', code: 'AUTHENTICATION_ERROR' });
  }

  try {
    const decoded = verifyAccessToken(token);

    req.user = decoded;

    next();
  } catch (err) {
    if (err instanceof AppError) {
      next(err);
      return;
    }

    next(
      new AppError({
        message: err instanceof Error ? err.message : 'Something went wrong',
        code: 'INTERNAL_SERVER_ERROR',
      }),
    );
    return;
  }
};

export const authorize =
  (allowedRoles: TRole[]) => (req: Request, _res: Response, next: NextFunction) => {
    try {
      const token = req.cookies[COOKIES_DATA.access_token.name] as string | undefined;

      if (!token) {
        throw new AppError({ message: 'Access token missing', code: 'AUTHENTICATION_ERROR' });
      }

      const decoded = verifyAccessToken(token);

      const isMaster = decoded.role === USER_ROLE_MAP.MASTER;
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
      if (err instanceof AppError) {
        next(err);
        return;
      }

      next(
        new AppError({
          message: err instanceof Error ? err.message : 'Something went wrong',
          code: 'INTERNAL_SERVER_ERROR',
        }),
      );
      return;
    }
  };

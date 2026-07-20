import { AuthenticationError, AuthorizationError } from '@beautinique/backend-classes';
import type { TUserRole } from '@beautinique/backend-types';
import { USER_ROLE_MAP } from '@beautinique/shared-constants';
import type { NextFunction, Request, Response } from 'express';

import { COOKIES_DATA } from '../constants/index.js';
import { verifyAccessToken } from '../utils/index.js';

// eslint-disable-next-line @typescript-eslint/require-await
export const authenticate = async (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies[COOKIES_DATA.access_token.name] as string | undefined;

  if (!token) {
    throw new AuthenticationError('Access token missing');
  }

  try {
    const decoded = verifyAccessToken(token);

    req.user = decoded;

    next();
  } catch (error) {
    next(error);
  }
};

export const authorize =
  (allowedRoles: readonly TUserRole[]) => (req: Request, _res: Response, next: NextFunction) => {
    try {
      const token = req.cookies[COOKIES_DATA.access_token.name] as string | undefined;

      if (!token) {
        throw new AuthenticationError('Access token missing');
      }

      const decoded = verifyAccessToken(token);

      const isMaster = decoded.role === USER_ROLE_MAP.MASTER;
      const hasAccess = allowedRoles.includes(decoded.role);

      if (!hasAccess && !isMaster) {
        throw new AuthorizationError('You are not authorized to perform this action');
      }

      req.user = decoded;

      next();
    } catch (error) {
      next(error);
    }
  };

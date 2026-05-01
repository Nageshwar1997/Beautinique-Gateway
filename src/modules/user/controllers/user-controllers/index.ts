import type { Response } from 'express';
import { AppError } from '@beautinique/be-classes';

import type { AuthRequest } from '../../../../types';
import { userService } from '../../services/UserService';
export const getSessionUserController = async (req: AuthRequest, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new AppError({ message: 'Unauthorized', statusCode: 401, code: 'AUTH_ERROR' });
  }

  const { message, statusCode, user } = await userService.getSessionUser(userId);
  res.success(statusCode, message, { user });
};

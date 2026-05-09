import { AppError } from '@beautinique/be-classes';
import type { Response } from 'express';

import type { AuthRequest } from '../../../../types';
import { userService } from '../../services/UserService';
export const getSessionUserController = async (req: AuthRequest, res: Response) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new AppError({ message: 'You are not logged in', code: 'AUTHENTICATION_ERROR' });
  }

  const { message, statusCode, user } = await userService.getSessionUser(userId);
  res.success(statusCode, message, { user });
};

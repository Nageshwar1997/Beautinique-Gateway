import { AppError } from '@beautinique/be-classes';
import type { Request, Response } from 'express';

import { userService } from '../../services/UserService';
export const getSessionUserController = async (req: Request, res: Response) => {
  const userId = req.user?._id;

  if (!userId) {
    throw new AppError({ message: 'You are not logged in', code: 'AUTHENTICATION_ERROR' });
  }

  const { message, statusCode, user } = await userService.getSessionUser(userId);
  res.success(statusCode, message, { user });
};

import { AppError } from '@beautinique/be-classes';
import type { Request, Response } from 'express';

import { getUser } from '../../../../utils';
import { userService } from '../../services/UserService';
export const getSessionUserController = async (req: Request, res: Response) => {
  const { _id: userId } = getUser(req);

  if (!userId) {
    throw new AppError({ message: 'You are not logged in', code: 'AUTHENTICATION_ERROR' });
  }

  const { message, statusCode, user } = await userService.getSessionUser(userId);
  res.success(statusCode, message, { user });
};

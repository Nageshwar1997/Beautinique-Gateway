import type { Response } from 'express';
import { userService } from '../../services/UserService';
import type { AuthRequest } from '@/types';
import { AppError } from '@beautinique/be-classes';

export const getUserDetailsController = async (req: AuthRequest, res: Response) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new AppError({ message: 'Unauthorized', statusCode: 401, code: 'AUTH_ERROR' });
  }

  const { message, statusCode, data } = await userService.getUserDetails(userId);

  res.success(statusCode, message, { data });
};

import type { Request, Response } from 'express';
import { getUser } from '../../../../utils';
import { userService } from '../../services';

export const getSessionUserController = async (req: Request, res: Response) => {
  const _user = getUser(req);

  const { message, statusCode, user } = await userService.getSessionUser(_user);
  res.success(statusCode, message, { user });
};

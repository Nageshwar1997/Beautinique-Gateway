import type { TUpdateUserZodSchema } from '@beautinique/backend-types';
import type { Request, Response } from 'express';

import { getAuthUser } from '../../../../utils/index.js';
import { userService } from '../../services/index.js';

export const getSessionUserController = async (req: Request, res: Response) => {
  const user = getAuthUser(req.user);

  const response = await userService.getSessionUser(user);

  res.success(response);
};

export const updateUserController = async (req: Request, res: Response) => {
  const user = getAuthUser(req.user);
  const body = req.body as TUpdateUserZodSchema;

  const response = await userService.updateUser(user, body);

  res.success(response);
};

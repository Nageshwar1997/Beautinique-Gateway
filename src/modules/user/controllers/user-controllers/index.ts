import type { Request, Response } from 'express';

import { getAuthUser } from '../../../../utils/index.js';
import { userService } from '../../services/index.js';

export const getSessionUserController = async (req: Request, res: Response) => {
  const user = getAuthUser(req.user);

  const response = await userService.getSessionUser(user);

  res.success(response);
};

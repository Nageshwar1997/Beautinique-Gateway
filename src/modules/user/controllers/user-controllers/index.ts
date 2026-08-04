import type {
  TChangePasswordZodSchema,
  TSetPasswordZodSchema,
  TUpdateUserZodSchema,
} from '@beautinique/backend-types';
import type { Request, Response } from 'express';

import { generateAuthTokens, getAuthUser, setAuthCookies } from '../../../../utils/index.js';
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

/* ================================ CHANGE PASSWORD CONTROLLERS ================================ */

export const changePasswordController = async (req: Request, res: Response) => {
  const user = getAuthUser(req.user);

  const body = req.body as TChangePasswordZodSchema;

  const response = await userService.changePassword(user, body);

  const { accessToken, refreshToken } = generateAuthTokens({ _id: user._id, role: user.role });

  setAuthCookies(res, accessToken, refreshToken);

  res.success(response);
};

/* ================================ SET PASSWORD CONTROLLERS ================================ */

export const setPasswordController = async (req: Request, res: Response) => {
  const user = getAuthUser(req.user);

  const body = req.body as TSetPasswordZodSchema;

  const response = await userService.setPassword(user, body);

  const { accessToken, refreshToken } = generateAuthTokens({ _id: user._id, role: user.role });

  setAuthCookies(res, accessToken, refreshToken);

  res.success(response);
};

import type { Request, Response } from 'express';
import { authService } from '../../services';
import { envs } from '@/envs';

export const googleRedirectController = async (_req: Request, res: Response) => {
  const { data: url } = await authService.getGoogleRedirectUrl();
  res.redirect(url);
};

export const googleCallbackController = async (req: Request, res: Response) => {
  const { code } = req.query;

  const { data: token } = await authService.handleGoogleCallback(String(code));

  if (token) {
    return res.redirect(`${envs.url.frontend.client}/auth?token=${token}`);
  }

  res.redirect(`${envs.url.frontend.client}/auth?error=Something went wrong!`);
};

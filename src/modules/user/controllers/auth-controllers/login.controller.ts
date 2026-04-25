import type { Request, Response } from 'express';
import { authService } from '../../services';
import { envs } from '@/envs';
import { AppError } from '@beautinique/be-classes';

export const googleRedirectController = async (_req: Request, res: Response) => {
  try {
    const { data: url } = await authService.getGoogleRedirectUrl();
    res.redirect(url);
  } catch (error) {
    res.redirect(
      `${envs.url.frontend.client}/auth/oauth?error=${(error as Error).message || 'Something went wrong!'}`,
    );
  }
};

export const googleCallbackController = async (req: Request, res: Response) => {
  const { code } = req.query;

  try {
    if (!code) throw new AppError({ message: 'No code returned from Google', statusCode: 400 });

    const { data: token } = await authService.handleGoogleCallback(String(code));

    res.redirect(`${envs.url.frontend.client}/auth/oauth?token=${token}`);
  } catch (error) {
    res.redirect(
      `${envs.url.frontend.client}/auth/oauth?error=${(error as Error).message || 'Something went wrong!'}`,
    );
  }
};

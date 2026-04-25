import type { Request, Response } from 'express';
import { authService } from '../../services';
import { AppError } from '@beautinique/be-classes';
import { CLIENT_OAUTH_REDIRECT_URL } from '../../constants';

export const googleRedirectController = async (_req: Request, res: Response) => {
  try {
    const { data: callbackURL } = await authService.getGoogleRedirectUrl();
    res.redirect(callbackURL);
  } catch (error) {
    res.redirect(
      `${CLIENT_OAUTH_REDIRECT_URL}?error=${(error as Error | AppError).message || 'Something went wrong!'}`,
    );
  }
};

export const googleCallbackController = async (req: Request, res: Response) => {
  const { code } = req.query;

  try {
    if (!code) throw new AppError({ message: 'No code returned from Google', statusCode: 400 });

    const { data: token } = await authService.handleGoogleCallback(String(code));

    res.redirect(`${CLIENT_OAUTH_REDIRECT_URL}?token=${token}`);
  } catch (error) {
    res.redirect(
      `${CLIENT_OAUTH_REDIRECT_URL}?error=${(error as Error | AppError).message || 'Something went wrong!'}`,
    );
  }
};

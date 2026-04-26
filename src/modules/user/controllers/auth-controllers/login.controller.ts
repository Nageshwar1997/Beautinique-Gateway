import type { Request, Response } from 'express';
import { authService } from '../../services';
import { AppError } from '@beautinique/be-classes';
import { CLIENT_OAUTH_REDIRECT_URL } from '../../constants';
import type { TLogin } from '@beautinique/be-zod';

export const manualLoginController = async (req: Request, res: Response) => {
  const body = req.body as TLogin;

  const { message, statusCode, data } = await authService.manualLogin(body);

  res.success(statusCode, message, { data });
};

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

  if (!code) {
    throw new AppError({
      message: 'No code returned from Google',
      code: 'VALIDATION_ERROR',
      statusCode: 400,
    });
  }

  try {
    const { data: token } = await authService.handleGoogleCallback(String(code));

    res.redirect(`${CLIENT_OAUTH_REDIRECT_URL}?token=${token}`);
  } catch (error) {
    res.redirect(
      `${CLIENT_OAUTH_REDIRECT_URL}?error=${(error as Error | AppError).message || 'Something went wrong!'}`,
    );
  }
};

export const linkedinRedirectController = async (_req: Request, res: Response) => {
  try {
    const { data: callbackURL } = await authService.getLinkedinRedirectUrl();
    res.redirect(callbackURL);
  } catch (error) {
    res.redirect(
      `${CLIENT_OAUTH_REDIRECT_URL}?error=${(error as Error | AppError).message || 'Something went wrong!'}`,
    );
  }
};

export const linkedinCallbackController = async (req: Request, res: Response) => {
  const { code } = req.query;

  if (!code) {
    throw new AppError({
      message: 'No code returned from Linkedin',
      code: 'VALIDATION_ERROR',
      statusCode: 400,
    });
  }

  try {
    const { data: token } = await authService.handleLinkedinCallback(String(code));

    res.redirect(`${CLIENT_OAUTH_REDIRECT_URL}?token=${token}`);
  } catch (error) {
    res.redirect(
      `${CLIENT_OAUTH_REDIRECT_URL}?error=${(error as Error | AppError).message || 'Something went wrong!'}`,
    );
  }
};

export const githubRedirectController = async (_req: Request, res: Response) => {
  try {
    const { data: callbackURL } = await authService.getGithubRedirectUrl();
    res.redirect(callbackURL);
  } catch (error) {
    res.redirect(
      `${CLIENT_OAUTH_REDIRECT_URL}?error=${(error as Error | AppError).message || 'Something went wrong!'}`,
    );
  }
};

export const githubCallbackController = async (req: Request, res: Response) => {
  const { code } = req.query;

  if (!code) {
    throw new AppError({
      message: 'No code returned from Github',
      code: 'VALIDATION_ERROR',
      statusCode: 400,
    });
  }

  try {
    const { data: token } = await authService.handleGithubCallback(String(code));

    res.redirect(`${CLIENT_OAUTH_REDIRECT_URL}?token=${token}`);
  } catch (error) {
    res.redirect(
      `${CLIENT_OAUTH_REDIRECT_URL}?error=${(error as Error | AppError).message || 'Something went wrong!'}`,
    );
  }
};

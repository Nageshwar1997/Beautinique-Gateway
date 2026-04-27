import type { TLogin, TRegister, TRegisterEmail, TRegisterOtp } from '@beautinique/be-zod';
import { authService } from '../../services';
import type { Request, Response } from 'express';
import { sanitizeToken } from '@beautinique/be-utils';
import { AppError } from '@beautinique/be-classes';
import {
  ACCESS_TOKEN_COOKIE_NAME,
  ACCESS_TOKEN_COOKIE_OPTIONS,
  CLIENT_OAUTH_REDIRECT_URL,
} from '../../constants';
import { generateAccessToken, verifyRefreshToken } from '@/utils';

/* ================================ REGISTER CONTROLLERS ================================ */

export const registerSendOtpController = async (req: Request, res: Response) => {
  const body = req.body as TRegisterEmail;
  const { message, statusCode, data } = await authService.registerSendOtp(body);
  res.success(statusCode, message, { data });
};

export const registerResendOtpController = async (req: Request, res: Response) => {
  const rawToken = req.get('Authorization') || '';
  const otpToken = sanitizeToken(rawToken);

  if (!rawToken || !otpToken) {
    throw new AppError({ message: 'Unauthorized', statusCode: 401, code: 'AUTH_ERROR' });
  }

  const { email } = req.body as TRegisterEmail;
  const { message, statusCode, data } = await authService.registerResendOtp({ email, otpToken });
  res.success(statusCode, message, { data });
};

export const registerVerifyOtpController = async (req: Request, res: Response) => {
  const rawToken = req.get('Authorization') || '';
  const otpToken = sanitizeToken(rawToken);

  if (!rawToken || !otpToken) {
    throw new AppError({ message: 'Unauthorized', statusCode: 401, code: 'AUTH_ERROR' });
  }

  const { otp } = req.body as TRegisterOtp;
  const { message, statusCode, data } = await authService.registerVerifyOtp({ otp, otpToken });
  res.success(statusCode, message, { data });
};

export const registerAndSaveController = async (req: Request, res: Response) => {
  const rawToken = req.get('Authorization') || '';
  const otpToken = sanitizeToken(rawToken);

  if (!rawToken || !otpToken) {
    throw new AppError({ message: 'Unauthorized', statusCode: 401, code: 'AUTH_ERROR' }); // NOTE - Don't change statusCode anyway, In frontend we handled logic base on it
  }

  const body = req.body as TRegister;

  const { message, statusCode, data } = await authService.registerAndSave({ ...body, otpToken });
  res.success(statusCode, message, { data });
};

/* ================================ LOGIN CONTROLLERS ================================ */

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

export const refreshAccessTokenController = async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new AppError({ message: 'Refresh token missing', statusCode: 401 });
  }

  const decoded = verifyRefreshToken(refreshToken);

  const newAccessToken = generateAccessToken(decoded);

  res.cookie(ACCESS_TOKEN_COOKIE_NAME, newAccessToken, ACCESS_TOKEN_COOKIE_OPTIONS);

  res.success(200, 'Token refreshed');
};

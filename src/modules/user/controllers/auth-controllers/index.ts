import { type AppError, BadRequestError } from '@beautinique/backend-classes';
import { HEADERS_MAP } from '@beautinique/backend-constants';
import type {
  TChangePasswordZodSchema,
  TEmailZodSchema,
  TLoginZodSchema,
  TOtpZodSchema,
  TPasswordsZodSchema,
  TRegisterZodSchema,
  TSetPasswordZodSchema,
  TUserRole,
} from '@beautinique/backend-types';
import type { Request, Response } from 'express';

import {
  clearAuthCookies,
  generateAuthTokens,
  getAuthUser,
  setAuthCookies,
} from '../../../../utils/index.js';
import { CLIENT_OAUTH_REDIRECT_URL } from '../../constants/index.js';
import { authService } from '../../services/index.js';

const buildOAuthErrorRedirectUrl = (error: unknown) => {
  const message = (error as Error | AppError).message || 'Something went wrong!';

  return `${CLIENT_OAUTH_REDIRECT_URL}?error=true&message=${encodeURIComponent(message)}`;
};

/* ================================ REGISTER CONTROLLERS ================================ */

export const registerSendOtpController = async (req: Request, res: Response) => {
  const body = req.body as TEmailZodSchema;

  const response = await authService.registerSendOtp(body);

  res.success(response);
};

export const registerResendOtpController = async (req: Request, res: Response) => {
  const token = req.get(HEADERS_MAP.authorization);

  if (!token) {
    throw new BadRequestError('Invalid or expired session');
  }

  const response = await authService.registerResendOtp(token);

  res.success(response);
};

export const registerVerifyOtpController = async (req: Request, res: Response) => {
  const token = req.get(HEADERS_MAP.authorization);

  if (!token) {
    throw new BadRequestError('Invalid or expired session');
  }

  const { otp } = req.body as TOtpZodSchema;

  const response = await authService.registerVerifyOtp({ otp, token });

  res.success(response);
};

export const registerAndSaveController = async (req: Request, res: Response) => {
  const token = req.get(HEADERS_MAP.authorization);

  if (!token) {
    throw new BadRequestError('Invalid or expired session');
  }

  const body = req.body as TRegisterZodSchema;

  const response = await authService.registerAndSave({ ...body, token });

  if (!response.data) {
    throw new BadRequestError('Invalid or expired session');
  }

  const { accessToken, refreshToken } = generateAuthTokens({
    _id: response.data._id,
    role: response.data.role,
  });

  setAuthCookies(res, accessToken, refreshToken);

  res.success(response);
};

/* ================================ LOGIN CONTROLLERS ================================ */

export const manualLoginController = async (req: Request, res: Response) => {
  const body = req.body as TLoginZodSchema;
  const role = req.get(HEADERS_MAP.loginRole) as TUserRole | undefined;

  const response = await authService.manualLogin(body, role);

  if (!response.data) {
    throw new BadRequestError('Invalid or expired session');
  }

  const { accessToken, refreshToken } = generateAuthTokens({
    _id: response.data._id,
    role: response.data.role,
  });

  setAuthCookies(res, accessToken, refreshToken);

  res.success(response);
};

export const googleRedirectController = async (_req: Request, res: Response) => {
  try {
    const { data: url } = await authService.getGoogleRedirectUrl();

    if (!url) {
      throw new BadRequestError('No redirect url returned from Google');
    }

    res.redirect(url);
  } catch (error) {
    res.redirect(buildOAuthErrorRedirectUrl(error));
  }
};

export const googleCallbackController = async (req: Request, res: Response) => {
  const code = req.query.code as string;

  if (!code) {
    throw new BadRequestError('No code returned from Google');
  }

  try {
    const { data: user } = await authService.handleGoogleCallback(code);

    if (!user) {
      throw new BadRequestError('No user returned from Google');
    }

    const { accessToken, refreshToken } = generateAuthTokens({ _id: user._id, role: user.role });

    setAuthCookies(res, accessToken, refreshToken);

    res.redirect(`${CLIENT_OAUTH_REDIRECT_URL}?success=true`);
  } catch (error) {
    res.redirect(buildOAuthErrorRedirectUrl(error));
  }
};

export const linkedinRedirectController = async (_req: Request, res: Response) => {
  try {
    const { data: url } = await authService.getLinkedinRedirectUrl();

    if (!url) {
      throw new BadRequestError('No url returned from Linkedin');
    }

    res.redirect(url);
  } catch (error) {
    res.redirect(buildOAuthErrorRedirectUrl(error));
  }
};

export const linkedinCallbackController = async (req: Request, res: Response) => {
  const code = req.query.code as string;

  if (!code) {
    throw new BadRequestError('No code returned from Linkedin');
  }

  try {
    const { data: user } = await authService.handleLinkedinCallback(code);

    if (!user) {
      throw new BadRequestError('No user returned from Linkedin');
    }

    const { accessToken, refreshToken } = generateAuthTokens({ _id: user._id, role: user.role });

    setAuthCookies(res, accessToken, refreshToken);

    res.redirect(`${CLIENT_OAUTH_REDIRECT_URL}?success=true`);
  } catch (error) {
    res.redirect(buildOAuthErrorRedirectUrl(error));
  }
};

export const githubRedirectController = async (_req: Request, res: Response) => {
  try {
    const { data: url } = await authService.getGithubRedirectUrl();

    if (!url) {
      throw new BadRequestError('No redirect url returned from Github');
    }

    res.redirect(url);
  } catch (error) {
    res.redirect(buildOAuthErrorRedirectUrl(error));
  }
};

export const githubCallbackController = async (req: Request, res: Response) => {
  const code = req.query.code as string;

  if (!code) {
    throw new BadRequestError('No code returned from Github');
  }

  try {
    const { data: user } = await authService.handleGithubCallback(code);

    if (!user) {
      throw new BadRequestError('No user returned from Github');
    }

    const { accessToken, refreshToken } = generateAuthTokens({
      _id: user._id,
      role: user.role,
    });

    setAuthCookies(res, accessToken, refreshToken);

    res.redirect(`${CLIENT_OAUTH_REDIRECT_URL}?success=true`);
  } catch (error) {
    res.redirect(buildOAuthErrorRedirectUrl(error));
  }
};

/* ================================ FORGOT PASSWORD CONTROLLERS ================================ */

export const forgotPasswordSendOtpController = async (req: Request, res: Response) => {
  const body = req.body as TEmailZodSchema;

  const response = await authService.forgotPasswordSendOtp(body);

  res.success(response);
};

export const forgotPasswordResendOtpController = async (req: Request, res: Response) => {
  const token = req.get(HEADERS_MAP.authorization);

  if (!token) {
    throw new BadRequestError('Invalid or expired session');
  }

  const response = await authService.forgotPasswordResendOtp(token);

  res.success(response);
};

export const forgotPasswordVerifyOtpController = async (req: Request, res: Response) => {
  const token = req.get(HEADERS_MAP.authorization);

  if (!token) {
    throw new BadRequestError('Invalid or expired session');
  }

  const { otp } = req.body as TOtpZodSchema;

  const response = await authService.forgotPasswordVerifyOtp({ otp, token });

  res.success(response);
};

export const forgotPasswordSaveController = async (req: Request, res: Response) => {
  const token = req.get(HEADERS_MAP.authorization);

  if (!token) {
    throw new BadRequestError('Invalid or expired session');
  }

  const body = req.body as TPasswordsZodSchema;

  const response = await authService.forgotPasswordSave({ ...body, token });

  if (!response.data) {
    throw new BadRequestError('Invalid or expired session');
  }

  const { accessToken, refreshToken } = generateAuthTokens({
    _id: response.data._id,
    role: response.data.role,
  });

  setAuthCookies(res, accessToken, refreshToken);

  res.success(response);
};

/* ================================ CHANGE PASSWORD CONTROLLERS ================================ */

export const changePasswordController = async (req: Request, res: Response) => {
  const user = getAuthUser(req.user);

  const body = req.body as TChangePasswordZodSchema;

  const response = await authService.changePassword(user, body);

  const { accessToken, refreshToken } = generateAuthTokens({ _id: user._id, role: user.role });

  setAuthCookies(res, accessToken, refreshToken);

  res.success(response);
};

/* ================================ SET PASSWORD CONTROLLERS ================================ */

export const setPasswordController = async (req: Request, res: Response) => {
  const user = getAuthUser(req.user);

  const body = req.body as TSetPasswordZodSchema;

  const response = await authService.setPassword(user, body);

  const { accessToken, refreshToken } = generateAuthTokens({ _id: user._id, role: user.role });

  setAuthCookies(res, accessToken, refreshToken);

  res.success(response);
};

/* ================================ LOGOUT CONTROLLERS ================================ */

export const logoutController = async (req: Request, res: Response) => {
  const user = getAuthUser(req.user);

  const response = await authService.logout(user);

  clearAuthCookies(res);

  res.success(response);
};

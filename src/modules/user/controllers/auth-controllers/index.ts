import type { TUserRole } from '@beautinique/backend-types';
import { AppError } from '@beautinique/be-classes';
import type {
  TChangePassword,
  TEmail,
  TLogin,
  TOtp,
  TPasswords,
  TRegister,
  TSetPassword,
} from '@beautinique/be-zod';
import { HEADERS_MAP } from '@beautinique/shared-constants';
import type { Request, Response } from 'express';

import {
  clearAuthCookies,
  generateAuthTokens,
  getAuthUser,
  setAuthCookies,
} from '../../../../utils/index.js';
import { CLIENT_OAUTH_REDIRECT_URL } from '../../constants/index.js';
import { authService } from '../../services/index.js';

/* ================================ REGISTER CONTROLLERS ================================ */

export const registerSendOtpController = async (req: Request, res: Response) => {
  const body = req.body as TEmail;

  const response = await authService.registerSendOtp(body);

  res.success(response);
};

export const registerResendOtpController = async (req: Request, res: Response) => {
  const token = req.get(HEADERS_MAP.authorization);

  if (!token) {
    throw new AppError({ message: 'Invalid or expired session', code: 'BAD_REQUEST' });
  }

  const response = await authService.registerResendOtp(token);

  res.success(response);
};

export const registerVerifyOtpController = async (req: Request, res: Response) => {
  const token = req.get(HEADERS_MAP.authorization);

  if (!token) {
    throw new AppError({ message: 'Invalid or expired session', code: 'BAD_REQUEST' });
  }

  const { otp } = req.body as TOtp;

  const response = await authService.registerVerifyOtp({ otp, token });

  res.success(response);
};

export const registerAndSaveController = async (req: Request, res: Response) => {
  const token = req.get(HEADERS_MAP.authorization);

  if (!token) {
    throw new AppError({ message: 'Invalid or expired session', code: 'BAD_REQUEST' });
  }

  const body = req.body as TRegister;

  const response = await authService.registerAndSave({ ...body, token });

  if (!response.data) {
    throw new AppError({ message: 'Invalid or expired session', code: 'BAD_REQUEST' });
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
  const body = req.body as TLogin;
  const role = req.get(HEADERS_MAP.loginRole) as TUserRole | undefined;

  const response = await authService.manualLogin(body, role);

  if (!response.data) {
    throw new AppError({ message: 'Invalid or expired session', code: 'BAD_REQUEST' });
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
      throw new AppError({ message: 'No redirect url returned from Google', code: 'BAD_REQUEST' });
    }

    res.redirect(url);
  } catch (error) {
    res.redirect(
      `${CLIENT_OAUTH_REDIRECT_URL}?error=true&message=${(error as Error | AppError).message || 'Something went wrong!'}`,
    );
  }
};

export const googleCallbackController = async (req: Request, res: Response) => {
  const code = req.query.code as string;

  if (!code) {
    throw new AppError({ message: 'No code returned from Google', code: 'BAD_REQUEST' });
  }

  try {
    const { data: user } = await authService.handleGoogleCallback(code);

    if (!user) {
      throw new AppError({ message: 'No user returned from Google', code: 'BAD_REQUEST' });
    }

    const { accessToken, refreshToken } = generateAuthTokens({ _id: user._id, role: user.role });

    setAuthCookies(res, accessToken, refreshToken);

    res.redirect(`${CLIENT_OAUTH_REDIRECT_URL}?success=true`);
  } catch (error) {
    res.redirect(
      `${CLIENT_OAUTH_REDIRECT_URL}?error=true&message=${(error as Error | AppError).message || 'Something went wrong!'}`,
    );
  }
};

export const linkedinRedirectController = async (_req: Request, res: Response) => {
  try {
    const { data: url } = await authService.getLinkedinRedirectUrl();

    if (!url) {
      throw new AppError({ message: 'No url returned from Linkedin', code: 'BAD_REQUEST' });
    }

    res.redirect(url);
  } catch (error) {
    res.redirect(
      `${CLIENT_OAUTH_REDIRECT_URL}?error=true&message=${(error as Error | AppError).message || 'Something went wrong!'}`,
    );
  }
};

export const linkedinCallbackController = async (req: Request, res: Response) => {
  const code = req.query.code as string;

  if (!code) {
    throw new AppError({ message: 'No code returned from Linkedin', code: 'BAD_REQUEST' });
  }

  try {
    const { data: user } = await authService.handleLinkedinCallback(code);

    if (!user) {
      throw new AppError({ message: 'No user returned from Linkedin', code: 'BAD_REQUEST' });
    }

    const { accessToken, refreshToken } = generateAuthTokens({ _id: user._id, role: user.role });

    setAuthCookies(res, accessToken, refreshToken);

    res.redirect(`${CLIENT_OAUTH_REDIRECT_URL}?success=true`);
  } catch (error) {
    res.redirect(
      `${CLIENT_OAUTH_REDIRECT_URL}?error=true&message=${(error as Error | AppError).message || 'Something went wrong!'}`,
    );
  }
};

export const githubRedirectController = async (_req: Request, res: Response) => {
  try {
    const { data: url } = await authService.getGithubRedirectUrl();

    if (!url) {
      throw new AppError({ message: 'No redirect url returned from Github', code: 'BAD_REQUEST' });
    }

    res.redirect(url);
  } catch (error) {
    res.redirect(
      `${CLIENT_OAUTH_REDIRECT_URL}?error=true&message=${(error as Error | AppError).message || 'Something went wrong!'}`,
    );
  }
};

export const githubCallbackController = async (req: Request, res: Response) => {
  const code = req.query.code as string;

  if (!code) {
    throw new AppError({ message: 'No code returned from Github', code: 'BAD_REQUEST' });
  }

  try {
    const { data: user } = await authService.handleGithubCallback(code);

    if (!user) {
      throw new AppError({ message: 'No user returned from Github', code: 'BAD_REQUEST' });
    }

    const { accessToken, refreshToken } = generateAuthTokens({
      _id: user._id,
      role: user.role,
    });

    setAuthCookies(res, accessToken, refreshToken);

    res.redirect(`${CLIENT_OAUTH_REDIRECT_URL}?success=true`);
  } catch (error) {
    res.redirect(
      `${CLIENT_OAUTH_REDIRECT_URL}?error=true&message=${(error as Error | AppError).message || 'Something went wrong!'}`,
    );
  }
};

/* ================================ FORGOT PASSWORD CONTROLLERS ================================ */

export const forgotPasswordSendOtpController = async (req: Request, res: Response) => {
  const body = req.body as TEmail;

  const response = await authService.forgotPasswordSendOtp(body);

  res.success(response);
};

export const forgotPasswordResendOtpController = async (req: Request, res: Response) => {
  const token = req.get(HEADERS_MAP.authorization);

  if (!token) {
    throw new AppError({ message: 'Invalid or expired session', code: 'BAD_REQUEST' });
  }

  const response = await authService.forgotPasswordResendOtp(token);

  res.success(response);
};

export const forgotPasswordVerifyOtpController = async (req: Request, res: Response) => {
  const token = req.get(HEADERS_MAP.authorization);

  if (!token) {
    throw new AppError({ message: 'Invalid or expired session', code: 'BAD_REQUEST' });
  }

  const { otp } = req.body as TOtp;

  const response = await authService.forgotPasswordVerifyOtp({ otp, token });

  res.success(response);
};

export const forgotPasswordSaveController = async (req: Request, res: Response) => {
  const token = req.get(HEADERS_MAP.authorization);

  if (!token) {
    throw new AppError({ message: 'Invalid or expired session', code: 'BAD_REQUEST' });
  }

  const body = req.body as TPasswords;

  const response = await authService.forgotPasswordSave({ ...body, token });

  if (!response.data) {
    throw new AppError({ message: 'Invalid or expired session', code: 'BAD_REQUEST' });
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

  const body = req.body as TChangePassword;

  const response = await authService.changePassword(user, body);

  const { accessToken, refreshToken } = generateAuthTokens({ _id: user._id, role: user.role });

  setAuthCookies(res, accessToken, refreshToken);

  res.success(response);
};

/* ================================ SET PASSWORD CONTROLLERS ================================ */

export const setPasswordController = async (req: Request, res: Response) => {
  const user = getAuthUser(req.user);

  const body = req.body as TSetPassword;

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

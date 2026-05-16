import { AppError } from '@beautinique/be-classes';
import type { TRole } from '@beautinique/be-constants';
import type {
  TChangePassword,
  TEmail,
  TLogin,
  TOtp,
  TPasswords,
  TRegister,
  TSetPassword,
} from '@beautinique/be-zod';
import type { Request, Response } from 'express';
import { HEADERS_KEYS } from '../../../../constants';
import { clearAuthCookies, generateAuthTokens, setAuthCookies } from '../../../../utils';
import { CLIENT_OAUTH_REDIRECT_URL } from '../../constants';
import { authService } from '../../services';

/* ================================ REGISTER CONTROLLERS ================================ */

export const registerSendOtpController = async (req: Request, res: Response) => {
  const body = req.body as TEmail;
  const { message, statusCode, token } = await authService.registerSendOtp(body);
  res.success(statusCode, message, { token });
};

export const registerResendOtpController = async (req: Request, res: Response) => {
  const token = req.get(HEADERS_KEYS.authorization) || '';

  if (!token) {
    throw new AppError({ message: 'Invalid or expired session', code: 'BAD_REQUEST' });
  }

  const { message, statusCode, sendCount } = await authService.registerResendOtp(token);
  res.success(statusCode, message, { sendCount });
};

export const registerVerifyOtpController = async (req: Request, res: Response) => {
  const token = req.get(HEADERS_KEYS.authorization) || '';

  if (!token) {
    throw new AppError({ message: 'Invalid or expired session', code: 'BAD_REQUEST' });
  }

  const { otp } = req.body as TOtp;
  const { message, statusCode } = await authService.registerVerifyOtp({ otp, token });

  res.success(statusCode, message);
};

export const registerAndSaveController = async (req: Request, res: Response) => {
  const token = req.get(HEADERS_KEYS.authorization) || '';

  if (!token) {
    throw new AppError({ message: 'Invalid or expired session', code: 'BAD_REQUEST' });
  }

  const body = req.body as TRegister;

  const { message, statusCode, user } = await authService.registerAndSave({ ...body, token });

  const { accessToken, refreshToken } = generateAuthTokens({ _id: user._id, role: user.role });

  setAuthCookies(res, accessToken, refreshToken);

  res.success(statusCode, message, { user });
};

/* ================================ LOGIN CONTROLLERS ================================ */

export const manualLoginController = async (req: Request, res: Response) => {
  const body = req.body as TLogin;
  const role = req.get(HEADERS_KEYS.loginRole) as TRole | undefined;

  const { message, statusCode, user } = await authService.manualLogin(body, role);

  const { accessToken, refreshToken } = generateAuthTokens({ _id: user._id, role: user.role });

  setAuthCookies(res, accessToken, refreshToken);

  res.success(statusCode, message, { user });
};

export const googleRedirectController = async (_req: Request, res: Response) => {
  try {
    const { url } = await authService.getGoogleRedirectUrl();

    res.redirect(url);
  } catch (error) {
    res.redirect(
      `${CLIENT_OAUTH_REDIRECT_URL}?error=true&message=${(error as Error | AppError).message || 'Something went wrong!'}`,
    );
  }
};

export const googleCallbackController = async (req: Request, res: Response) => {
  const { code } = req.query;

  if (!code) {
    throw new AppError({ message: 'No code returned from Google', code: 'BAD_REQUEST' });
  }

  try {
    const { user } = await authService.handleGoogleCallback(String(code));

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
    const { url } = await authService.getLinkedinRedirectUrl();

    res.redirect(url);
  } catch (error) {
    res.redirect(
      `${CLIENT_OAUTH_REDIRECT_URL}?error=true&message=${(error as Error | AppError).message || 'Something went wrong!'}`,
    );
  }
};

export const linkedinCallbackController = async (req: Request, res: Response) => {
  const { code } = req.query;

  if (!code) {
    throw new AppError({ message: 'No code returned from Linkedin', code: 'BAD_REQUEST' });
  }

  try {
    const { user } = await authService.handleLinkedinCallback(String(code));

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
    const { url } = await authService.getGithubRedirectUrl();

    res.redirect(url);
  } catch (error) {
    res.redirect(
      `${CLIENT_OAUTH_REDIRECT_URL}?error=true&message=${(error as Error | AppError).message || 'Something went wrong!'}`,
    );
  }
};

export const githubCallbackController = async (req: Request, res: Response) => {
  const { code } = req.query;

  if (!code) {
    throw new AppError({ message: 'No code returned from Github', code: 'BAD_REQUEST' });
  }

  try {
    const { user } = await authService.handleGithubCallback(String(code));

    const { accessToken, refreshToken } = generateAuthTokens({ _id: user._id, role: user.role });

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
  const { message, statusCode, token } = await authService.forgotPasswordSendOtp(body);
  res.success(statusCode, message, { token });
};

export const forgotPasswordResendOtpController = async (req: Request, res: Response) => {
  const token = req.get(HEADERS_KEYS.authorization) || '';

  if (!token) {
    throw new AppError({ message: 'Invalid or expired session', code: 'BAD_REQUEST' });
  }

  const { message, statusCode, sendCount } = await authService.forgotPasswordResendOtp(token);
  res.success(statusCode, message, { sendCount });
};

export const forgotPasswordVerifyOtpController = async (req: Request, res: Response) => {
  const token = req.get(HEADERS_KEYS.authorization) || '';

  if (!token) {
    throw new AppError({ message: 'Invalid or expired session', code: 'BAD_REQUEST' });
  }

  const { otp } = req.body as TOtp;
  const { message, statusCode } = await authService.forgotPasswordVerifyOtp({ otp, token });

  res.success(statusCode, message);
};

export const forgotPasswordSaveController = async (req: Request, res: Response) => {
  const token = req.get(HEADERS_KEYS.authorization) || '';

  if (!token) {
    throw new AppError({ message: 'Invalid or expired session', code: 'BAD_REQUEST' });
  }

  const body = req.body as TPasswords;

  const { message, statusCode, user } = await authService.forgotPasswordSave({ ...body, token });

  const { accessToken, refreshToken } = generateAuthTokens({ _id: user._id, role: user.role });

  setAuthCookies(res, accessToken, refreshToken);

  res.success(statusCode, message, { user });
};

/* ================================ CHANGE PASSWORD CONTROLLERS ================================ */

export const changePasswordController = async (req: Request, res: Response) => {
  const userId = req.user?._id || '';
  const body = req.body as TChangePassword;

  const { message, statusCode, user } = await authService.changePassword(userId, body);

  const { accessToken, refreshToken } = generateAuthTokens({ _id: user._id, role: user.role });

  setAuthCookies(res, accessToken, refreshToken);

  res.success(statusCode, message, { user });
};

/* ================================ SET PASSWORD CONTROLLERS ================================ */

export const setPasswordController = async (req: Request, res: Response) => {
  const userId = req.user?._id || '';
  const body = req.body as TSetPassword;

  const { message, statusCode, user } = await authService.setPassword(userId, body);

  const { accessToken, refreshToken } = generateAuthTokens({ _id: user._id, role: user.role });

  setAuthCookies(res, accessToken, refreshToken);

  res.success(statusCode, message, { user });
};

/* ================================ LOGOUT CONTROLLERS ================================ */

export const logoutController = async (req: Request, res: Response) => {
  const userId = req.user?._id || '';

  const { message, statusCode } = await authService.logout(userId);
  clearAuthCookies(res);
  res.success(statusCode, message);
};

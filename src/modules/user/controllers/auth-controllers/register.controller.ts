import type { Request, Response } from 'express';
import type { TRegister } from '@beautinique/be-zod';
import { authService } from '../../services';
import { sanitizeToken } from '@beautinique/be-utils';
import { AppError } from '@beautinique/be-classes';

export const registerSendOtpController = async (req: Request, res: Response) => {
  const body = req.body as Pick<TRegister, 'email'>;
  const { message, statusCode, data } = await authService.registerSendOtp(body);
  res.success(statusCode, message, { data });
};

export const registerResendOtpController = async (req: Request, res: Response) => {
  const rawToken = req.get('Authorization') || '';
  const otpToken = sanitizeToken(rawToken);

  if (!rawToken || !otpToken) {
    throw new AppError({ message: 'Unauthorized', statusCode: 401, code: 'AUTH_ERROR' });
  }

  const { email } = req.body as Pick<TRegister, 'email'>;
  const { message, statusCode, data } = await authService.registerResendOtp({ email, otpToken });
  res.success(statusCode, message, { data });
};

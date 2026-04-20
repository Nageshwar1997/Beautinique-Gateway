import type { Request, Response } from 'express';
import type { TRegister } from '@beautinique/be-zod';
import { authService } from '../../services';

export const registerSendOtpController = async (req: Request, res: Response) => {
  const body = req.body as Pick<TRegister, 'email'>;
  const { message, statusCode, data } = await authService.registerSendOtp(body);
  res.success(statusCode, message, { data });
};

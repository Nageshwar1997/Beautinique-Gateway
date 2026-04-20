import { GATEWAY_METHODS_AND_PATHS } from '@/constants';
import { Router } from 'express';
import { registerSendOtpController } from '../../controllers';
import { RequestMiddleware, ResponseMiddleware, ZodMiddleware } from '@beautinique/be-middlewares';
import { registerEmailSchema } from '@beautinique/be-zod';

export const registerRouter = Router();

const { sendOtp } = GATEWAY_METHODS_AND_PATHS.user.auth.register;

registerRouter[sendOtp.method](
  sendOtp.path,
  RequestMiddleware.emptyRequest({ body: true }),
  ZodMiddleware.validateSchema(registerEmailSchema),
  ResponseMiddleware.tryCatch(registerSendOtpController),
);

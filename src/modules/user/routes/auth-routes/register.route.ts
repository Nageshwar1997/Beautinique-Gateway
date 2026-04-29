import { GATEWAY_METHODS_AND_PATHS } from '@/constants';
import { Router } from 'express';
import {
  registerAndSaveController,
  registerResendOtpController,
  registerSendOtpController,
  registerVerifyOtpController,
} from '../../controllers';
import { RequestMiddleware, ResponseMiddleware, ZodMiddleware } from '@beautinique/be-middlewares';
import { registerEmailSchema, registerOtpSchema, registerSchema } from '@beautinique/be-zod';

export const registerRouter = Router();

const { resendOtp, saveUser, sendOtp, verifyOtp } = GATEWAY_METHODS_AND_PATHS.user.auth.register;

registerRouter[sendOtp.method](
  sendOtp.path,
  RequestMiddleware.emptyRequest({ body: true }),
  ZodMiddleware.validateSchema(registerEmailSchema),
  ResponseMiddleware.tryCatch(registerSendOtpController),
);

registerRouter[resendOtp.method](
  resendOtp.path,
  ResponseMiddleware.tryCatch(registerResendOtpController),
);

registerRouter[verifyOtp.method](
  verifyOtp.path,
  RequestMiddleware.emptyRequest({ body: true }),
  ZodMiddleware.validateSchema(registerOtpSchema),
  ResponseMiddleware.tryCatch(registerVerifyOtpController),
);

registerRouter[saveUser.method](
  saveUser.path,
  RequestMiddleware.emptyRequest({ body: true }),
  ZodMiddleware.validateSchema(registerSchema),
  ResponseMiddleware.tryCatch(registerAndSaveController),
);

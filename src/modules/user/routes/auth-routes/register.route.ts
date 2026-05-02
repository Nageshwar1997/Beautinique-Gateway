import { Router } from 'express';

import { RequestMiddleware, ResponseMiddleware, ZodMiddleware } from '@beautinique/be-middlewares';
import { emailSchema, otpSchema, registerSchema } from '@beautinique/be-zod';

import { GATEWAY_METHODS_AND_PATHS } from '../../../../constants';
import {
  registerAndSaveController,
  registerResendOtpController,
  registerSendOtpController,
  registerVerifyOtpController,
} from '../../controllers';

export const registerRouter = Router();

const { resendOtp, saveUser, sendOtp, verifyOtp } = GATEWAY_METHODS_AND_PATHS.user.auth.register;

registerRouter[sendOtp.method](
  sendOtp.path,
  RequestMiddleware.emptyRequest({ body: true }),
  ZodMiddleware.validateSchema(emailSchema),
  ResponseMiddleware.tryCatch(registerSendOtpController),
);

registerRouter[resendOtp.method](
  resendOtp.path,
  ResponseMiddleware.tryCatch(registerResendOtpController),
);

registerRouter[verifyOtp.method](
  verifyOtp.path,
  RequestMiddleware.emptyRequest({ body: true }),
  ZodMiddleware.validateSchema(otpSchema),
  ResponseMiddleware.tryCatch(registerVerifyOtpController),
);

registerRouter[saveUser.method](
  saveUser.path,
  RequestMiddleware.emptyRequest({ body: true }),
  ZodMiddleware.validateSchema(registerSchema),
  ResponseMiddleware.tryCatch(registerAndSaveController),
);

import { RequestMiddleware, ResponseMiddleware, ZodMiddleware } from '@beautinique/be-middlewares';
import {
  changePasswordSchema,
  emailSchema,
  otpSchema,
  passwordsSchema,
  setPasswordSchema,
} from '@beautinique/be-zod';
import { Router } from 'express';
import { GATEWAY_METHODS_AND_PATHS } from '../../../../constants';
import {
  changePasswordController,
  forgotPasswordResendOtpController,
  forgotPasswordSaveController,
  forgotPasswordSendOtpController,
  forgotPasswordVerifyOtpController,
  setPasswordController,
} from '../../controllers';

export const passwordRouter = Router();

const { forgot, change, set } = GATEWAY_METHODS_AND_PATHS.user.auth.password;

// Forgot Password Routes
passwordRouter[forgot.sendOtp.method](
  forgot.sendOtp.path,
  RequestMiddleware.emptyRequest({ body: true }),
  ZodMiddleware.validateSchema(emailSchema),
  ResponseMiddleware.tryCatch(forgotPasswordSendOtpController),
);

passwordRouter[forgot.resendOtp.method](
  forgot.resendOtp.path,
  ResponseMiddleware.tryCatch(forgotPasswordResendOtpController),
);

passwordRouter[forgot.verifyOtp.method](
  forgot.verifyOtp.path,
  RequestMiddleware.emptyRequest({ body: true }),
  ZodMiddleware.validateSchema(otpSchema),
  ResponseMiddleware.tryCatch(forgotPasswordVerifyOtpController),
);

passwordRouter[forgot.save.method](
  forgot.save.path,
  RequestMiddleware.emptyRequest({ body: true }),
  ZodMiddleware.validateSchema(passwordsSchema),
  ResponseMiddleware.tryCatch(forgotPasswordSaveController),
);

// Change Password Routes
passwordRouter[change.method](
  change.path,
  RequestMiddleware.emptyRequest({ body: true }),
  ZodMiddleware.validateSchema(changePasswordSchema),
  ResponseMiddleware.tryCatch(changePasswordController),
);

// Set Password Routes
passwordRouter[set.method](
  set.path,
  RequestMiddleware.emptyRequest({ body: true }),
  ZodMiddleware.validateSchema(setPasswordSchema),
  ResponseMiddleware.tryCatch(setPasswordController),
);

import { checkEmptyRequest, tryCatchResponse, zodValidator } from '@beautinique/be-middlewares';
import {
  changePasswordSchema,
  emailSchema,
  otpSchema,
  passwordsSchema,
  setPasswordSchema,
} from '@beautinique/be-zod';
import { Router } from 'express';
import { GATEWAY_METHODS_AND_PATHS } from '../../../../constants';
import { authenticate } from '../../../../middlewares';
import type { AuthRequest } from '../../../../types';
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
  checkEmptyRequest({ body: true }),
  zodValidator(emailSchema),
  tryCatchResponse(forgotPasswordSendOtpController),
);

passwordRouter[forgot.resendOtp.method](
  forgot.resendOtp.path,
  tryCatchResponse(forgotPasswordResendOtpController),
);

passwordRouter[forgot.verifyOtp.method](
  forgot.verifyOtp.path,
  checkEmptyRequest({ body: true }),
  zodValidator(otpSchema),
  tryCatchResponse(forgotPasswordVerifyOtpController),
);

passwordRouter[forgot.save.method](
  forgot.save.path,
  checkEmptyRequest({ body: true }),
  zodValidator(passwordsSchema),
  tryCatchResponse(forgotPasswordSaveController),
);

// Change Password Routes
passwordRouter[change.method](
  change.path,
  authenticate,
  checkEmptyRequest({ body: true }),
  zodValidator(changePasswordSchema),
  tryCatchResponse<AuthRequest>(changePasswordController),
);

// Set Password Routes
passwordRouter[set.method](
  set.path,
  authenticate,
  checkEmptyRequest({ body: true }),
  zodValidator(setPasswordSchema),
  tryCatchResponse<AuthRequest>(setPasswordController),
);

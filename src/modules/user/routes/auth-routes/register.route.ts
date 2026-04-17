import { GATEWAY_METHODS_AND_PATHS } from '@/constants';
import { Router } from 'express';
import { registerControllers } from '../../controllers';
import { ResponseMiddleware } from '@beautinique/be-middlewares';

export const registerRouter = Router();

const { sendOtp } = GATEWAY_METHODS_AND_PATHS.user.auth.register;

registerRouter[sendOtp.method](
  sendOtp.path,
  ResponseMiddleware.tryCatch(registerControllers.sendOtp),
);

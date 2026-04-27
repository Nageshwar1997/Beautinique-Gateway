import { GATEWAY_METHODS_AND_PATHS } from '@/constants';
import { Router } from 'express';
import { refreshAccessTokenController } from '../../controllers';
import { authenticate, tryCatch } from '@/middlewares';

export const tokenRouter = Router();

const { token } = GATEWAY_METHODS_AND_PATHS.user.auth;

tokenRouter[token.refreshAccessToken.method](
  token.refreshAccessToken.path,
  authenticate,
  tryCatch(refreshAccessTokenController),
);

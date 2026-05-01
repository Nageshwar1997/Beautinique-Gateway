import { Router } from 'express';

import { ResponseMiddleware } from '@beautinique/be-middlewares';

import { refreshAccessTokenController } from '../../controllers';
import { GATEWAY_METHODS_AND_PATHS } from '../../../../constants';

export const tokenRouter = Router();

const { token } = GATEWAY_METHODS_AND_PATHS.user.auth;

tokenRouter[token.refreshAccessToken.method](
  token.refreshAccessToken.path,
  ResponseMiddleware.tryCatch(refreshAccessTokenController),
);

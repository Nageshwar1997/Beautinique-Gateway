import { Router } from 'express';

import { tryCatchResponse } from '@beautinique/be-middlewares';
import { METHODS_AND_PATHS } from '../constants';
import { refreshAccessTokenController } from '../controllers';
import { productServiceRouter } from '../modules/product/routes';
import { userServiceRouter } from '../modules/user';

export const router = Router();

const {
  gateway: { refreshAccessToken },
  user_service,
  product_service,
} = METHODS_AND_PATHS;

router[refreshAccessToken.method](
  refreshAccessToken.path,
  tryCatchResponse(refreshAccessTokenController),
);

// API Routes

router.use(user_service.default, userServiceRouter);
router.use(product_service.default, productServiceRouter);

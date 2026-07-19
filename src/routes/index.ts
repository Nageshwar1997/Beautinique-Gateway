import { tryCatchResponse } from '@beautinique/backend-response';
import { Router } from 'express';

import { METHODS_AND_PATHS } from '../constants/index.js';
import { refreshAccessTokenController } from '../controllers/index.js';
import { productServiceRouter } from '../modules/product/index.js';
import { userServiceRouter } from '../modules/user/index.js';

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

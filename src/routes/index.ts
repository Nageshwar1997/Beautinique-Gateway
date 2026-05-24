import { Router } from 'express';

import { tryCatchResponse } from '@beautinique/be-middlewares';
import { METHODS_AND_PATHS } from '../constants';
import { refreshAccessTokenController, wakeUpController } from '../controllers';
import { productServiceRouter } from '../modules/product/routes';
import { userServiceRouter } from '../modules/user';

export const router = Router();

const {
  gateway: { health, home, refreshAccessToken, wakeUp },
  user_service,
  product_service,
} = METHODS_AND_PATHS;

// Home Route
router[home.method](home.path, (_, res) => res.success(200, 'Welcome to Beautinique Gateway!'));

router[health.method](health.path, (_, res) => res.success(200, 'Beautinique Gateway is healthy'));

router[wakeUp.method](wakeUp.path, wakeUpController);

router[refreshAccessToken.method](
  refreshAccessToken.path,
  tryCatchResponse(refreshAccessTokenController),
);

// API Routes

router.use(user_service.base, userServiceRouter);
router.use(product_service.base, productServiceRouter);

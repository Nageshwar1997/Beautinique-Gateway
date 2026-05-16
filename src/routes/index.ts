import { Router } from 'express';

import { GATEWAY_METHODS_AND_PATHS } from '../constants';
import { userServiceRouter } from '../modules/user';
import { productServiceRouter } from '../modules/product/routes';

export const router = Router();

const { user, product } = GATEWAY_METHODS_AND_PATHS;

router.use(user.base, userServiceRouter);
router.use(product.base, productServiceRouter);

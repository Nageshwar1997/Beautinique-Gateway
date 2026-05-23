import { Router } from 'express';

import { METHODS_AND_PATHS } from '../constants';
import { productServiceRouter } from '../modules/product/routes';
import { userServiceRouter } from '../modules/user';

export const router = Router();

const { user_service, product_service } = METHODS_AND_PATHS;

router.use(user_service.base, userServiceRouter);
router.use(product_service.base, productServiceRouter);

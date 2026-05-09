import { Router } from 'express';

import { GATEWAY_METHODS_AND_PATHS } from '../constants';
import { userServiceRouter } from '../modules/user';

export const router = Router();

const { user } = GATEWAY_METHODS_AND_PATHS;

router.use(user.base, userServiceRouter);

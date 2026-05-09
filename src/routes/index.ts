import { Router } from 'express';

import { GATEWAY_METHODS_AND_PATHS } from '../constants';
import { mediaServiceProxy } from '../middlewares';
import { userServiceRouter } from '../modules/user';

export const router = Router();

const { media, user } = GATEWAY_METHODS_AND_PATHS;

router.use(media.base, mediaServiceProxy);
router.use(user.base, userServiceRouter);

import { Router } from 'express';

import { METHODS_AND_PATHS } from '../../../constants/index.js';
import { authRouter } from './auth-routes/index.js';
import { userRouter } from './user-routes/index.js';

export const userServiceRouter = Router();
const { user, auth } = METHODS_AND_PATHS.user_service;

userServiceRouter.use(auth.base, authRouter);
userServiceRouter.use(user.base, userRouter);

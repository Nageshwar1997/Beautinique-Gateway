import { Router } from 'express';

import { ROUTES } from '../../../constants';
import { authRouter } from './auth-routes';
import { userRouter } from './user-routes';

export const userServiceRouter = Router();
const { user, auth } = ROUTES.user_service;

userServiceRouter.use(auth.base, authRouter);
userServiceRouter.use(user.base, userRouter);

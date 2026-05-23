import { Router } from 'express';
import { METHODS_AND_PATHS } from '../../../constants';
import { authRouter } from './auth-routes';
import { userRouter } from './user-routes';

export const userServiceRouter = Router();
const { user, auth } = METHODS_AND_PATHS.user_service;

userServiceRouter.use(auth.base, authRouter);
userServiceRouter.use(user.base, userRouter);

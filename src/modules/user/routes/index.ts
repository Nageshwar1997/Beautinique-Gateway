import { GATEWAY_METHODS_AND_PATHS } from '@/constants';
import { Router } from 'express';
import { authRouter } from './auth-routes';
import { userRouter } from './user-routes';

export const userServiceRouter = Router();

const { auth, user } = GATEWAY_METHODS_AND_PATHS.user;

userServiceRouter.use(auth.base, authRouter);
userServiceRouter.use(user.base, userRouter);

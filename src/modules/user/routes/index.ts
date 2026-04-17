import { GATEWAY_METHODS_AND_PATHS } from '@/constants';
import { Router } from 'express';
import { authRouter } from './auth-routes';
import { userRouter } from './user-routes';

export const userServiceRouter = Router();
const { user: _user } = GATEWAY_METHODS_AND_PATHS;

const { auth, user } = _user;

userServiceRouter.use(auth.base, authRouter);
userServiceRouter.use(user.base, userRouter);

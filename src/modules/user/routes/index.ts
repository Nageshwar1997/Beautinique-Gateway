import { Router } from 'express';

import { METHODS_AND_PATHS } from '../../../constants/index.js';
import { adminRouter } from './admin-routes/index.js';
import { authRouter } from './auth-routes/index.js';
import { userRouter } from './user-routes/index.js';

export const userServiceRouter = Router();
const { admin, auth, user } = METHODS_AND_PATHS.user_service;

userServiceRouter.use(auth.base, authRouter);
userServiceRouter.use(user.base, userRouter);
userServiceRouter.use(admin.base, adminRouter);

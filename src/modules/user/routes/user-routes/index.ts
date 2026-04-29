import { GATEWAY_METHODS_AND_PATHS } from '@/constants';
import { authenticate } from '@/middlewares';
import { ResponseMiddleware } from '@beautinique/be-middlewares';
import { Router } from 'express';
import { getSessionUserController } from '../../controllers/user-controllers';

export const userRouter = Router();
const { session } = GATEWAY_METHODS_AND_PATHS.user.user;
userRouter[session.method](
  session.path,
  ResponseMiddleware.tryCatch(authenticate),
  ResponseMiddleware.tryCatch(getSessionUserController),
);

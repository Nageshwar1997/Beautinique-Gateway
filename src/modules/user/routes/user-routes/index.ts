import { tryCatchResponse } from '@beautinique/be-middlewares';
import { Router } from 'express';
import { ROUTES } from '../../../../constants';
import { authenticate } from '../../../../middlewares';
import { getSessionUserController } from '../../controllers/user-controllers';

export const userRouter = Router();

const { session } = ROUTES.user_service.user;

userRouter[session.method](session.path, authenticate, tryCatchResponse(getSessionUserController));

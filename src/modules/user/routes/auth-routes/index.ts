import { tryCatchResponse } from '@beautinique/be-middlewares';
import { Router } from 'express';
import { METHODS_AND_PATHS } from '../../../../constants';
import { authenticate } from '../../../../middlewares';
import { logoutController } from '../../controllers';
import { loginRouter } from './login.route';
import { passwordRouter } from './password.route';
import { registerRouter } from './register.route';

export const authRouter = Router();

const { login, logout, password, register } = METHODS_AND_PATHS.user_service.auth;

authRouter[logout.method](logout.path, authenticate, tryCatchResponse(logoutController));
authRouter.use(register.base, registerRouter);
authRouter.use(login.base, loginRouter);
authRouter.use(password.base, passwordRouter);

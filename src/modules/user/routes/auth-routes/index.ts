import { Router } from 'express';

import { registerRouter } from './register.route';
import { loginRouter } from './login.route';
import { passwordRouter } from './password.route';
import { tokenRouter } from './token.route';
import { GATEWAY_METHODS_AND_PATHS } from '../../../../constants';

export const authRouter = Router();

const { auth } = GATEWAY_METHODS_AND_PATHS.user;

authRouter.use(auth.register.base, registerRouter);
authRouter.use(auth.login.base, loginRouter);
authRouter.use(auth.token.base, tokenRouter);
authRouter.use(auth.password.base, passwordRouter);

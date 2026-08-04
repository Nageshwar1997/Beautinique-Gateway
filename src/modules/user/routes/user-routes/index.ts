import { checkEmptyRequest } from '@beautinique/backend-request';
import { tryCatchResponse } from '@beautinique/backend-response';
import {
  changePasswordZodSchema,
  setPasswordZodSchema,
  updateUserZodSchema,
  validateZod,
} from '@beautinique/backend-zod';
import { Router } from 'express';

import { METHODS_AND_PATHS } from '../../../../constants/index.js';
import { authenticate } from '../../../../middlewares/index.js';
import {
  changePasswordController,
  getSessionUserController,
  setPasswordController,
  updateUserController,
} from '../../controllers/index.js';

export const userRouter = Router();

const { session, update, password } = METHODS_AND_PATHS.user_service.user;

userRouter[session.method](session.path, authenticate, tryCatchResponse(getSessionUserController));

userRouter[update.method](
  update.path,
  authenticate,
  checkEmptyRequest({ body: true }),
  validateZod({ body: updateUserZodSchema }),
  tryCatchResponse(updateUserController),
);

// Change Password Routes
userRouter[password.change.method](
  password.change.path,
  authenticate,
  checkEmptyRequest({ body: true }),
  validateZod({ body: changePasswordZodSchema }),
  tryCatchResponse(changePasswordController),
);

// Set Password Routes
userRouter[password.set.method](
  password.set.path,
  authenticate,
  checkEmptyRequest({ body: true }),
  validateZod({ body: setPasswordZodSchema }),
  tryCatchResponse(setPasswordController),
);

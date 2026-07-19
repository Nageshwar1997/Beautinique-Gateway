import { checkEmptyRequest } from '@beautinique/backend-request';
import { tryCatchResponse } from '@beautinique/backend-response';
import { loginZodSchema, validateZod } from '@beautinique/backend-zod';
import { Router } from 'express';

import { METHODS_AND_PATHS } from '../../../../constants/index.js';
import {
  githubCallbackController,
  githubRedirectController,
  googleCallbackController,
  googleRedirectController,
  linkedinCallbackController,
  linkedinRedirectController,
  manualLoginController,
} from '../../controllers/index.js';

export const loginRouter = Router();

const { manual, oauth } = METHODS_AND_PATHS.user_service.auth.login;
const { github, google, linkedin } = oauth;

// Manual
loginRouter[manual.method](
  manual.path,
  checkEmptyRequest({ body: true }),
  validateZod({ body: loginZodSchema }),
  tryCatchResponse(manualLoginController),
);

// Google
loginRouter[google.redirect.method](
  google.redirect.path,
  tryCatchResponse(googleRedirectController),
);

loginRouter[google.callback.method](
  google.callback.path,
  checkEmptyRequest({ query: true }),
  tryCatchResponse(googleCallbackController),
);

// LinkedIn
loginRouter[linkedin.redirect.method](
  linkedin.redirect.path,
  tryCatchResponse(linkedinRedirectController),
);

loginRouter[linkedin.callback.method](
  linkedin.callback.path,
  checkEmptyRequest({ query: true }),
  tryCatchResponse(linkedinCallbackController),
);

// GitHub
loginRouter[github.redirect.method](
  github.redirect.path,
  tryCatchResponse(githubRedirectController),
);

loginRouter[github.callback.method](
  github.callback.path,
  checkEmptyRequest({ query: true }),
  tryCatchResponse(githubCallbackController),
);

import { checkEmptyRequest, tryCatchResponse, zodValidator } from '@beautinique/be-middlewares';
import { loginSchema } from '@beautinique/be-zod';
import { Router } from 'express';
import { METHODS_AND_PATHS } from '../../../../constants';
import {
  githubCallbackController,
  githubRedirectController,
  googleCallbackController,
  googleRedirectController,
  linkedinCallbackController,
  linkedinRedirectController,
  manualLoginController,
} from '../../controllers';

export const loginRouter = Router();

const { manual, oauth } = METHODS_AND_PATHS.user_service.auth.login;
const { github, google, linkedin } = oauth;

// Manual
loginRouter[manual.method](
  manual.path,
  checkEmptyRequest({ body: true }),
  zodValidator(loginSchema),
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

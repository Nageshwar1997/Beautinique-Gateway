import { GATEWAY_METHODS_AND_PATHS } from '@/constants';
import { RequestMiddleware, ResponseMiddleware, ZodMiddleware } from '@beautinique/be-middlewares';
import { Router } from 'express';
import {
  githubCallbackController,
  githubRedirectController,
  googleCallbackController,
  googleRedirectController,
  linkedinCallbackController,
  linkedinRedirectController,
  manualLoginController,
} from '../../controllers';
import { loginSchema } from '@beautinique/be-zod';

export const loginRouter = Router();

const { login } = GATEWAY_METHODS_AND_PATHS.user.auth;

// Manual
loginRouter[login.manual.method](
  login.manual.path,
  RequestMiddleware.emptyRequest({ body: true }),
  ZodMiddleware.validateSchema(loginSchema),
  ResponseMiddleware.tryCatch(manualLoginController),
);

// Google
loginRouter[login.oauth.google.redirect.method](
  login.oauth.google.redirect.path,
  ResponseMiddleware.tryCatch(googleRedirectController),
);

loginRouter[login.oauth.google.callback.method](
  login.oauth.google.callback.path,
  RequestMiddleware.emptyRequest({ query: true }),
  ResponseMiddleware.tryCatch(googleCallbackController),
);

// LinkedIn
loginRouter[login.oauth.linkedin.redirect.method](
  login.oauth.linkedin.redirect.path,
  ResponseMiddleware.tryCatch(linkedinRedirectController),
);

loginRouter[login.oauth.linkedin.callback.method](
  login.oauth.linkedin.callback.path,
  RequestMiddleware.emptyRequest({ query: true }),
  ResponseMiddleware.tryCatch(linkedinCallbackController),
);

// GitHub
loginRouter[login.oauth.github.redirect.method](
  login.oauth.github.redirect.path,
  ResponseMiddleware.tryCatch(githubRedirectController),
);

loginRouter[login.oauth.github.callback.method](
  login.oauth.github.callback.path,
  RequestMiddleware.emptyRequest({ query: true }),
  ResponseMiddleware.tryCatch(githubCallbackController),
);

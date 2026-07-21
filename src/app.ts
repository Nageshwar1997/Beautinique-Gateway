import { corsMiddleware } from '@beautinique/backend-cors';
import { createHttpLogger } from '@beautinique/backend-logger';
import { errorResponse, notFoundResponse, successResponse } from '@beautinique/backend-response';
import { HEADERS_MAP, USER_ROLES } from '@beautinique/shared-constants';
import cookieParser from 'cookie-parser';
import express from 'express';
import path from 'path';
import { parse } from 'qs';
import swaggerUi from 'swagger-ui-express';

import { logger } from './configs/index.js';
import { LOGGER_BASE_OPTIONS, METHODS_AND_PATHS, ORIGINS } from './constants/index.js';
import { healthController, wakeUpController } from './controllers/index.js';
import { openApiSpec } from './docs/openapi.js';
import { envs } from './envs/index.js';
import { authorize, mediaServiceProxy } from './middlewares/index.js';
import { router } from './routes/index.js';

const { base, health, home, wakeUp, media_service } = METHODS_AND_PATHS;

/* -------------------------------------------------------------------------- */
/*                               Express App                                  */
/* -------------------------------------------------------------------------- */

export const app = express();

/* -------------------------------------------------------------------------- */
/*                                Middlewares                                 */
/* -------------------------------------------------------------------------- */

app.set('query parser', (str: string) => parse(str));

/**
 * Allows only the platform's own frontends (client/admin/seller/master) to call this
 * gateway cross-origin, with cookies included (`credentials: true`) - required since the
 * session lives entirely in the `access_token`/`refresh_token` cookies. Mounted first so
 * preflight (OPTIONS) requests are answered before hitting auth/proxy/routing below -
 * without this, a preflight to the media-service proxy would hit `authorize()` first and
 * get rejected, since preflight requests never carry cookies.
 */
app.use(
  corsMiddleware({
    origin: ORIGINS,
    allowedHeaders: [HEADERS_MAP.contentType, HEADERS_MAP.authorization, HEADERS_MAP.loginRole],
    credentials: true,
    // `@beautinique/backend-cors` has no default of its own for this option - passing it
    // through as `undefined` makes the underlying `cors` package crash with
    // `RangeError: Invalid status code: undefined` while ending a preflight response.
    optionsSuccessStatus: 204,
    onOriginDenied: (origin) => {
      logger.warn(`Blocked CORS request from origin: ${origin}`);
    },
  }),
);

/**
 * Parses cookies on incoming requests into `req.cookies` - needed by
 * `authenticate`/`authorize` below, so it must run before them.
 */
app.use(cookieParser());

/**
 * Logs every incoming request.
 */
app.use(createHttpLogger({ ...LOGGER_BASE_OPTIONS, logger: logger }));

/**
 * Proxies media-service traffic (file uploads) before the body parsers
 * below - `http-proxy` streams the raw request body through, so it must
 * run before anything that would consume/buffer that stream.
 */
app.use(`${base}${media_service.default}`, authorize(USER_ROLES), mediaServiceProxy);

/**
 * Parses incoming JSON payloads.
 */
app.use(express.json({ limit: '10mb' }));

/**
 * Parses URL encoded form data.
 */
app.use(express.urlencoded({ extended: true }));

/**
 * Serves static assets.
 */
app.use(express.static(path.resolve('public'), { index: false }));

/**
 * Adds success response helpers.
 */
app.use(successResponse({ defaultMessage: 'Success.' }));

/* -------------------------------------------------------------------------- */
/*                                   Routes                                   */
/* -------------------------------------------------------------------------- */

/**
 * Serves the README, pre-rendered to HTML by `scripts/generate-html.mjs`
 * (runs automatically after `npm run build` via the "postbuild" script) -
 * avoids re-parsing markdown on every request.
 */
app[home.method](home.path, (_, res) => {
  res.sendFile(path.resolve('public', 'index.html'));
});

/**
 * Server wake-up (All Services) endpoint.
 */
app[wakeUp.method](wakeUp.path, wakeUpController);

/**
 * Interactive API docs (OpenAPI/Swagger) - unauthenticated, same as `/`
 * and `/health`, so it stays reachable without a service secret.
 */
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

/**
 * Health endpoint.
 */
app[health.method](health.path, healthController);

/**
 * API routes - requires a trusted service caller and a ready DB connection.
 *
 * `checkDbConnection` is scoped to this router (not global) so `/` and
 * `/health` above can still respond while MongoDB is unavailable.
 */
app.use(base, router);

/* -------------------------------------------------------------------------- */
/*                              Error Handlers                                */
/* -------------------------------------------------------------------------- */

app.use(notFoundResponse({ serveHtml: true }));

app.use(errorResponse({ includeStack: envs.is_dev }));

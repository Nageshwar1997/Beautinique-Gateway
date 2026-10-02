import { HEADERS_MAP, USER_ROLES } from '@beautinique/backend-constants';
import { checkCors } from '@beautinique/backend-cors';
import { createHttpLogger } from '@beautinique/backend-logger';
import { errorResponse, notFoundResponse, successResponse } from '@beautinique/backend-response';
import cookieParser from 'cookie-parser';
import express from 'express';
import path from 'path';
import { parse } from 'qs';
import swaggerUi from 'swagger-ui-express';

import { logger } from './configs/index.js';
import { LOGGER_BASE_OPTIONS, METHODS_AND_PATHS, ORIGINS } from './constants/index.js';
import { healthController } from './controllers/index.js';
import { openApiSpec } from './docs/openapi.js';
import { envs } from './envs/index.js';
import {
  apiRateLimiter,
  authorize,
  authRateLimiter,
  mediaServiceProxy,
  overallHealthRateLimiter,
} from './middlewares/index.js';
import { router } from './routes/index.js';

const { base, health, home, overall_health, wakeUp, media_service, user_service } =
  METHODS_AND_PATHS;

/* -------------------------------------------------------------------------- */
/*                               Express App                                  */
/* -------------------------------------------------------------------------- */

export const app = express();

/* -------------------------------------------------------------------------- */
/*                                Middlewares                                 */
/* -------------------------------------------------------------------------- */

app.set('query parser', (str: string) => parse(str));

/**
 * The gateway runs behind Render's load balancer, so the socket's remote address is always the
 * balancer. Trusting that many proxy hops makes `req.ip` the real client IP (from
 * `X-Forwarded-For`) - what the rate limiters below key on. A hop count, not `true`, on purpose:
 * `true` would trust a client-supplied `X-Forwarded-For` and let anyone dodge the limits.
 */
app.set('trust proxy', envs.trust_proxy_hops);

/**
 * Allows only the platform's own frontends (client/admin/seller/master) to call this
 * gateway cross-origin, with cookies included (`credentials: true`) - required since the
 * session lives entirely in the `access_token`/`refresh_token` cookies. Mounted first so
 * preflight (OPTIONS) requests are answered before hitting auth/proxy/routing below -
 * without this, a preflight to the media-service proxy would hit `authorize()` first and
 * get rejected, since preflight requests never carry cookies.
 */
app.use(
  checkCors({
    origin: [
      ...ORIGINS,
      'http://localhost:4173',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:3004',
    ],
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
 * Rate limits - right after CORS (so preflights are already answered and a 429 still carries the
 * CORS headers the browser needs to read it) and before everything costly (cookies, logging,
 * proxying, body parsing). Auth endpoints get a second, much tighter limit on top of the general
 * API one.
 */
app.use(base, apiRateLimiter);
app.use(`${base}${user_service.default}${user_service.auth.base}`, authRateLimiter);

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
/**
 * Service wake-up endpoint.
 */
app[wakeUp.method](wakeUp.path, (_, res) => {
  res.success({ message: 'Gateway is awaked.' });
});

/**
 * Interactive API docs (OpenAPI/Swagger) - unauthenticated, same as `/`
 * and `/health`, so it stays reachable without a service secret.
 */
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

/**
 * Health endpoint.
 */
app[health.method](health.path, (_req, res) => {
  res.success({
    message: 'Gateway is Healthy',
    data: { service: 'gateway-service', status: 'HEALTHY' },
  });
});

app[overall_health.method](overall_health.path, overallHealthRateLimiter, healthController);

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

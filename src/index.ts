import cookieParser from 'cookie-parser';
import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import path from 'path';
import { parse } from 'qs';

import { CorsMiddleware, RequestMiddleware, ResponseMiddleware } from '@beautinique/be-middlewares';

import { GATEWAY_METHODS_AND_PATHS, ORIGINS } from './constants';
import { wakeUpController } from './controllers';
import { envs } from './envs';
import { errorLogger, logger, mediaServiceProxy, requestLogger } from './middlewares';
import { router } from './routes';

const { base, media } = GATEWAY_METHODS_AND_PATHS;

const app = express();
let server: ReturnType<typeof app.listen> | null = null;

// ----------------- MIDDLEWARES ORDER -----------------

// 1. Assign requestId first (for tracing logs)
app.use(RequestMiddleware.requestId);

// 2. CORS (before anything that depends on request)
app.use(
  CorsMiddleware.checkOrigin({
    origins: ORIGINS,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }),
);

// 3. Cookie parser
app.use(cookieParser());

// 4. Logger (logs all requests)
app.use(requestLogger);

// 5. Raw proxy routes (before body parsers so request streams pass through as-it-is)
app.use(`${base}${media.base}`, mediaServiceProxy);

// 6. Body parsers & static files
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve('public')));
app.set('query parser', (str: string) => parse(str));

// 7. Custom response middleware
app.use(ResponseMiddleware.success);

// ----------------- ROUTES -----------------

// Home Route
app.get('/', (_: Request, res: Response) => res.success(200, 'Welcome to Beautinique Gateway!'));
app.get('/health', (_: Request, res: Response) =>
  res.success(200, 'Beautinique Gateway is healthy'),
);
app.get('/wake-up', wakeUpController);

// API Routes
app.use(base, router);

// ----------------- ERROR HANDLING -----------------
app.use(ResponseMiddleware.notFound);
app.use(errorLogger);
app.use(ResponseMiddleware.error({ isDev: envs.is_dev }));

/* ---------------- START ---------------- */

async function start() {
  try {
    // 🌐 Start server
    server = app.listen(envs.port, () => {
      logger.info(`🚀 Server running on port: ${envs.port}`);
    });
  } catch (err) {
    logger.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

/* ---------------- SHUTDOWN ---------------- */

async function shutdown() {
  logger.warn('🛑 Shutting down...');

  try {
    // Close server gracefully
    if (server) {
      await new Promise<void>((resolve) => {
        server?.close(() => {
          logger.info('🌐 Server closed');
          resolve();
        });
      });
    }

    logger.info('✅ Shutdown complete');
    process.exit(0);
  } catch (err) {
    logger.error('❌ Shutdown error:', err);
    process.exit(1);
  }
}

/* ---------------- PROCESS SIGNALS ---------------- */

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

/* ---------------- BOOTSTRAP ---------------- */

start();

/* ---------------- EXPORT ---------------- */

export { app };

import cookieParser from 'cookie-parser';
import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import path from 'path';
import { parse } from 'qs';

import { CorsMiddleware, RequestMiddleware, ResponseMiddleware } from '@beautinique/be-middlewares';

import { ORIGINS } from './constants';
import { wakeUpController } from './controllers';
import { envs } from './envs';
import { errorLogger, logger, requestLogger } from './middlewares';
import { router } from './routes';

const app = express();

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

// 4. Body parsers & static files
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve('public')));
app.set('query parser', (str: string) => parse(str));

// 5. Logger (logs all requests)
app.use(requestLogger);

// 6. Custom response middleware
app.use(ResponseMiddleware.success);

// ----------------- ROUTES -----------------

// Home Route
app.get('/', (_: Request, res: Response) => res.success(200, 'Welcome to Beautinique Gateway!'));
app.get('/health', (_: Request, res: Response) =>
  res.success(200, 'Beautinique Gateway is healthy'),
);
app.get('/wake-up', ResponseMiddleware.tryCatch(wakeUpController));

// API Routes
app.use('/gateway/api/v1', router);

// ----------------- ERROR HANDLING -----------------
app.use(ResponseMiddleware.notFound);
app.use(errorLogger);
app.use(ResponseMiddleware.error({ isDev: envs.is_dev }));

(async () => {
  try {
    app.listen(envs.port, () => {
      logger.info(`Server running on port: ${envs.port}`);
    });
  } catch (err) {
    logger.error('❌ Failed to start server:', err);
    process.exit(1);
  }
})();

export { app };


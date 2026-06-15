import {
  checkCors,
  errorResponse,
  notFoundResponse,
  setRequestId,
  successResponse,
} from '@beautinique/be-middlewares';
import cookieParser from 'cookie-parser';
import 'dotenv/config';
import express from 'express';
import type { Socket } from 'node:net';
import path from 'path';
import { parse } from 'qs';
import { HEADERS_KEYS, METHODS_AND_PATHS, ORIGINS } from './constants';
import { wakeUpController } from './controllers';
import { envs } from './envs';
import {
  authenticate,
  authorize,
  errorLogs,
  logger,
  mediaServiceProxy,
  requestLogs,
} from './middlewares';
import { router } from './routes';

const { base, media_service } = METHODS_AND_PATHS;

const app = express();

app.set('query parser', (str: string) => parse(str));

let server: ReturnType<typeof app.listen> | null = null;

/* ---------------- CONNECTION TRACKING ---------------- */

const connections = new Set<Socket>();

/* ---------------- MIDDLEWARES ORDER ---------------- */

// 1. Request ID (must be first)
app.use(setRequestId);

// 2. CORS (before anything that depends on request)
app.use(
  checkCors({
    origins: ORIGINS,
    allowedHeaders: [HEADERS_KEYS.contentType, HEADERS_KEYS.authorization, HEADERS_KEYS.loginRole],
    credentials: true,
  }),
);

// 3. Cookies parser
app.use(cookieParser());

// 4. Request logger (logs all requests)
app.use(requestLogs);

// 5. Static files middleware
app.use(express.static(path.resolve('public')));

// 6. Proxy routes (BEFORE body parsers)
app.use(
  `${base}${media_service.default}`,
  authenticate,
  authorize(['ADMIN', 'SELLER', 'MASTER']),
  mediaServiceProxy,
);

// 7. Body parsers
app.use(express.json({ limit: '10mb' }));

// 8. Custom response middleware
app.use(successResponse);

/* ---------------- ROUTES ---------------- */

// Home Route
app.get('/', (_, res) => res.success(200, 'Welcome to Beautinique Gateway!'));

// Health Route
app.get('/health', (_, res) => res.success(200, 'Beautinique Gateway is healthy'));

// Wake Up Route
app.get('/wake-up', wakeUpController);

app.use(base, router);

/* ---------------- ERROR HANDLING ---------------- */

app.use(notFoundResponse);
app.use(errorLogs);
app.use(errorResponse({ isDev: envs.is_dev }));

/* ---------------- START ---------------- */

async function start() {
  try {
    await new Promise<void>((resolve, reject) => {
      const onError = (err: Error) => {
        reject(err);
      };

      const httpServer = app.listen(envs.port, () => {
        httpServer.off('error', onError);
        logger.info(`🚀 Server running on port: ${envs.port}`);
        resolve();
      });

      server = httpServer;
      httpServer.once('error', onError);
    });

    const httpServer = server;

    if (!httpServer) {
      throw new Error('HTTP server did not initialize');
    }

    httpServer.on('error', (err) => {
      logger.error('❌ HTTP server error:', err);
    });

    // Track active connections
    httpServer.on('connection', (socket: Socket) => {
      connections.add(socket);

      socket.on('close', () => {
        connections.delete(socket);
      });
    });

    // Optional hard timeouts
    httpServer.keepAliveTimeout = 65_000;
    httpServer.headersTimeout = 66_000;
  } catch (err) {
    logger.error('❌ Failed to start server:', err);
    process.exit(1);
  }
}

/* ---------------- SHUTDOWN ---------------- */

async function shutdown(signal: string) {
  logger.warn(`🛑 Received ${signal}. Starting graceful shutdown...`);

  try {
    if (server) {
      // Force close hanging sockets after timeout
      const forceCloseTimer = setTimeout(() => {
        logger.warn('⚠️ Force closing hanging connections...');

        for (const socket of connections) {
          socket.destroy();
        }
      }, 10_000);

      // Stop accepting new connections and wait until active ones close
      await new Promise<void>((resolve, reject) => {
        server?.close((err) => {
          clearTimeout(forceCloseTimer);

          if (err) return reject(err);

          logger.info('🌐 HTTP server closed');
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

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

/* ---------------- BOOTSTRAP ---------------- */

void start();

/* ---------------- EXPORT ---------------- */

export { app };

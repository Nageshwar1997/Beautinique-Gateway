import { logger } from '../configs/index.js';
import {
  destroyConnections,
  isServerRunning,
  resetStarted,
  setShuttingDown,
  stopHttpServer,
} from './server.js';

/* -------------------------------------------------------------------------- */
/*                             Shutdown Sequence                              */
/* -------------------------------------------------------------------------- */

/**
 * Gracefully shuts down the application.
 *
 * Safe to call multiple times.
 *
 * Shutdown order:
 * 1. Stop accepting HTTP requests.
 * 2. Stop BullMQ workers.
 * 3. Close BullMQ connection.
 * 4. Disconnect MongoDB.
 * 5. Destroy any remaining sockets.
 * 6. Exit process.
 */
export const shutdown = async (signal: NodeJS.Signals): Promise<void> => {
  if (!setShuttingDown()) {
    return;
  }

  logger.warn(`🛑 Received ${signal}. Starting graceful shutdown...`);

  try {
    if (isServerRunning()) {
      await stopHttpServer();
    }

    destroyConnections();

    logger.info('✅ Graceful shutdown completed');

    process.exitCode = 0;
  } catch (error) {
    logger.error(`❌ Shutdown failed: ${String(error)}`);

    process.exitCode = 1;
  } finally {
    resetStarted();

    process.exit(process.exitCode);
  }
};

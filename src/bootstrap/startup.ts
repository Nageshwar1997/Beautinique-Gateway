import { logger } from '../configs/index.js';
import { resetShuttingDown, resetStarted, setStarted, startHttpServer } from './server.js';

/* -------------------------------------------------------------------------- */
/*                              Startup Sequence                              */
/* -------------------------------------------------------------------------- */

/**
 * Starts the complete application.
 *
 * Safe to call multiple times.
 *
 * Startup order:
 * 1. Register MongoDB event listeners.
 * 2. Connect MongoDB and Redis in parallel.
 * 3. Start the HTTP server.
 */
export const startup = async (): Promise<void> => {
  if (!setStarted()) {
    return;
  }

  try {
    await startHttpServer();

    logger.info('✅ Gateway initialized');

    resetShuttingDown();
  } catch (error: unknown) {
    resetStarted();

    resetShuttingDown();

    logger.error(`❌ Failed to start gateway: ${String(error)}`);

    process.exit(1);
  }
};

import { createLogger } from '@beautinique/backend-logger';

import { LOGGER_BASE_OPTIONS } from '../constants/index.js';

export const logger = createLogger({ ...LOGGER_BASE_OPTIONS, service: 'Gateway', logsDir: 'logs' });

import { envs } from '@/envs';
import { LoggerMiddleware } from '@beautinique/be-middlewares';

export const { errorLogger, logger, requestLogger } = LoggerMiddleware.createLogger({
  serviceName: 'Beautinique-Gateway',
  logDir: 'logs',
  level: envs.is_dev ? 'debug' : 'info',
});

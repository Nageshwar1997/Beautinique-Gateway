import { LoggerMiddleware } from '@beautinique/be-middlewares';

export const { requestLog, errorLog, logger } = LoggerMiddleware.createLogger({
  logDir: 'logs',
  level: 'info',
});

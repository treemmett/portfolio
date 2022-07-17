import { createLogger, format, transports } from 'winston';
import { Config } from './config';

export const logger = createLogger({
  transports: [
    new transports.Console({
      format: Config.NODE_ENV === 'production' ? format.json() : format.simple(),
    }),
  ],
});

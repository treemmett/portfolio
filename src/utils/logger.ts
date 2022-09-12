import { pino } from 'pino';
import { Config } from './config';

const isProd = Config.NODE_ENV === 'production';

export const logger = pino({
  redact: {
    paths: isProd ? ['req.headers.cookie', 'res.headers["set-cookie"]'] : [],
  },
});

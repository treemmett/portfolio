import 'reflect-metadata';
import { NextApiRequest, NextApiResponse } from 'next';
import NC, { Middleware } from 'next-connect';
import pinoHttp from 'pino-http';
import { useAnalytics } from './analytics';
import type { User } from '@entities/User';
import { errorHandler } from '@utils/errors';
import { logger } from '@utils/logger';

const httpLogger = pinoHttp({
  logger,
});

export interface ApiRequest extends NextApiRequest {
  user: User;
}

export type ApiMiddleware = Middleware<ApiRequest, NextApiResponse>;

export const nextConnect = () =>
  NC<ApiRequest, NextApiResponse>({
    onError: errorHandler,
    onNoMatch(req, res) {
      logger.error('No match found', { req });
      res.status(404).json({ error: 'Route not found' });
    },
  })
    .use(useAnalytics)
    .use((req, res, next) => {
      httpLogger(req, res);
      next();
    });

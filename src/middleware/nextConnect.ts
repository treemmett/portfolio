import 'reflect-metadata';
import { isCelebrateError } from 'celebrate';
import { NextApiRequest, NextApiResponse } from 'next';
import NC, { Middleware } from 'next-connect';
import pinoHttp from 'pino-http';
import { useAnalytics } from './analytics';
import type { User } from '@entities/User';
import { APIError } from '@utils/errors';
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
    onError: (err, req, res, next) => {
      logger.error({ err }, 'Request error caught');

      if (isCelebrateError(err)) {
        // @ts-expect-error celebrate wasn't built for next
        // TODO
        celebrateErrorHandler(err, req, res, next);
        return;
      }

      if (err instanceof APIError) {
        res.status(err.status).send({ error: { code: err.code, message: err.message } });
      } else {
        res
          .status(500)
          .send({ error: { code: 'UnknownError', message: 'Unknown error occurred' } });
      }
    },
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

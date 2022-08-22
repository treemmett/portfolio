import 'reflect-metadata';
import '../mock';
import { NextApiRequest, NextApiResponse } from 'next';
import NC from 'next-connect';
import { errorHandler } from '../utils/errors';
import { logger } from '../utils/logger';

export const nextConnect = () =>
  NC<NextApiRequest, NextApiResponse>({
    onError: errorHandler,
    onNoMatch(req, res) {
      logger.error('No match found', { req });
      res.status(404).json({ error: 'Route not found' });
    },
  });

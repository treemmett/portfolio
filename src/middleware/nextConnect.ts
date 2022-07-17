import 'reflect-metadata';
import '../../cypress/mock';
import { NextApiResponse } from 'next';
import NC from 'next-connect';
import { authenticateRequest } from '../utils/auth';
import { errorHandler } from '../utils/errors';
import { logger } from '../utils/logger';
import { bodyParser, ParsedApiRequest } from './bodyParser';

export const nextConnect = () =>
  NC<ParsedApiRequest, NextApiResponse>({
    onError: errorHandler,
    onNoMatch(req, res) {
      logger.error('No match found', { req });
      res.status(404).json({ error: 'Route not found' });
    },
  })
    .use(bodyParser)
    .use(authenticateRequest);

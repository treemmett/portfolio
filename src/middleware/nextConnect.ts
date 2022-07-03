import { NextApiResponse } from 'next';
import NC from 'next-connect';
import { authenticateRequest } from '../utils/auth';
import { errorHandler } from '../utils/errors';
import { bodyParser, ParsedApiRequest } from './bodyParser';
import { connectToDB } from './database';

await connectToDB();

export const nextConnect = NC<ParsedApiRequest, NextApiResponse>({
  onError: errorHandler,
  onNoMatch(req, res) {
    res.status(404).json({ error: 'Route not found' });
  },
})
  .use(bodyParser)
  .use(authenticateRequest);
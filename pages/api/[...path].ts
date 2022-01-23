import 'reflect-metadata';
import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect from 'next-connect';

export default nextConnect<NextApiRequest, NextApiResponse>({
  onError(err, req, res) {
    res.status(500).json({ error: 'Something broke' });
  },
  onNoMatch(req, res) {
    res.status(404).json({ error: 'Route not found' });
  },
})
  .post('/api/test', (req, res) => res.end('hi'))
  .post('/api/test/one', (req, res) => res.end('one'));

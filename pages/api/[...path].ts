import 'reflect-metadata';
import { NextApiResponse, PageConfig } from 'next';
import nextConnect from 'next-connect';
import { bodyParser, ParsedApiRequest } from '../../middleware/bodyParser';

export default nextConnect<ParsedApiRequest, NextApiResponse>({
  onError(err, req, res) {
    res.status(500).json({ err: err.toString(), error: 'Something broke' });
  },
  onNoMatch(req, res) {
    res.status(404).json({ error: 'Route not found' });
  },
})
  .use(bodyParser)
  .post('/api/photo', async (req, res) => {
    res.json([req.body, req.files]);
  });

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};

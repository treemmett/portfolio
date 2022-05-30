import 'reflect-metadata';
import { NextApiResponse, PageConfig } from 'next';
import nextConnect from 'next-connect';
import { Photo } from '../../entities/Photo';
import { Post } from '../../entities/Post';
import { bodyParser, ParsedApiRequest } from '../../middleware/bodyParser';
import { connectToDB } from '../../middleware/database';

await connectToDB();

export default nextConnect<ParsedApiRequest, NextApiResponse>({
  onError(err, req, res) {
    res.status(500).json({ err: err.toString(), error: 'Something broke', stack: err.stack });
  },
  onNoMatch(req, res) {
    res.status(404).json({ error: 'Route not found' });
  },
})
  .use(bodyParser)
  .get('/api/photo', async (req, res) => res.json(await Photo.getAll()))
  .get('/api/post', async (req, res) => res.json(await Post.getAll()))
  .post('/api/photo', async (req, res) => res.json(await Photo.upload(req.files.file.filepath)))
  .post('/api/post', async (req, res) => res.json(await Post.upload(req.files.file.filepath)));

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};

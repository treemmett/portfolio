import 'reflect-metadata';
import { serialize } from 'cookie';
import { NextApiResponse, PageConfig } from 'next';
import nextConnect from 'next-connect';
import { Photo } from '../../entities/Photo';
import { Post } from '../../entities/Post';
import { bodyParser, ParsedApiRequest } from '../../middleware/bodyParser';
import { connectToDB } from '../../middleware/database';
import { authenticateRequest, authorizeGitHub } from '../../utils/auth';
import { errorHandler } from '../../utils/errors';
import { toString } from '../../utils/queryParam';

await connectToDB();

export default nextConnect<ParsedApiRequest, NextApiResponse>({
  onError: errorHandler,
  onNoMatch(req, res) {
    res.status(404).json({ error: 'Route not found' });
  },
})
  .use(bodyParser)
  .post('/api/login', async (req, res) => {
    const { accessToken, expiration, signature } = await authorizeGitHub(req.body.code);
    res.setHeader(
      'Set-Cookie',
      serialize('xsrf-token', signature, {
        expires: expiration,
        httpOnly: true,
        path: '/',
      })
    );
    res.send(accessToken);
  })
  .use(authenticateRequest)
  .get('/api/photo', async (req, res) => res.json(await Photo.getAll()))
  .get('/api/post', async (req, res) => {
    const id = toString(req.query.id);
    res.send(await (id ? Post.get(id) : Post.getAll()));
  })
  .post('/api/photo', async (req, res) => res.json(await Photo.upload(req.files.file.filepath)))
  .post('/api/post', async (req, res) => res.json(await Post.upload(req.files.file.filepath)));

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};

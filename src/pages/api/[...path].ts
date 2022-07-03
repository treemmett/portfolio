import 'reflect-metadata';
import '../../../cypress/mock';
import { serialize } from 'cookie';
import { PageConfig } from 'next';
import { Photo } from '../../entities/Photo';
import { Post } from '../../entities/Post';
import { nextConnect } from '../../middleware/nextConnect';
import { authorizeGitHub } from '../../utils/auth';
import { toString } from '../../utils/queryParam';

export default nextConnect
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

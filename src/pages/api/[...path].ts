import 'reflect-metadata';
import '../../middleware/database';
import '../../../cypress/mock';
import { serialize } from 'cookie';
import { PageConfig } from 'next';
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
  .get('/api/post', async (req, res) => {
    const id = toString(req.query.id);
    if (id) {
      const post = await Post.findOne(id, { relations: ['photos'] });
      res.send(post);
    } else {
      const posts = await Post.find({ relations: ['photos'] });
      res.send(posts);
    }
  })
  .post('/api/post', async (req, res) => res.json(await Post.upload(req.files.file.filepath)));

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};

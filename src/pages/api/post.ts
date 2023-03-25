import { AuthorizationScopes } from '@entities/Jwt';
import { Post } from '@entities/Post';
import { Session } from '@entities/Session';
import { connectToDatabaseMiddleware } from '@middleware/database';
import { nextConnect } from '@middleware/nextConnect';
import { logger } from '@utils/logger';
import { i18nRevalidate } from '@utils/revalidate';

export default nextConnect()
  .use(connectToDatabaseMiddleware)
  .get(async (req, res) => {
    const posts = await Post.getAll();
    res.send(posts);
  })
  .patch(Session.authorizeRequest(AuthorizationScopes.post), async (req, res) => {
    await i18nRevalidate('/', res);
  })
  .post(Session.authorizeRequest(AuthorizationScopes.post), async (req, res) => {
    const token = await Post.requestUploadToken();
    res.send(token);
  })
  .put(Session.authorizeRequest(AuthorizationScopes.post), async (req, res) => {
    const post = await Post.processUpload(req.body.token);
    res.send(post);
    logger.info('Post created, revalidating cache');
    await i18nRevalidate('/', res);
    logger.info('Cache revalidated');
  });

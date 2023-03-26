import { AuthorizationScopes } from '@entities/Jwt';
import { Post } from '@entities/Post';
import { User } from '@entities/User';
import { connectToDatabaseMiddleware } from '@middleware/database';
import { nextConnect } from '@middleware/nextConnect';
import { logger } from '@utils/logger';
import { i18nRevalidate } from '@utils/revalidate';

export default nextConnect()
  .use(connectToDatabaseMiddleware)
  .get(async (req, res) => {
    const posts = await Post.getAllFromUser((req.query.username as string) || 'treemmett');
    res.send(posts);
  })
  .patch(User.authorize(AuthorizationScopes.post), async (req, res) => {
    await i18nRevalidate('/', res);
  })
  .post(User.authorize(AuthorizationScopes.post), async (req, res) => {
    const token = await Post.requestUploadToken();
    res.send(token);
  })
  .put(User.authorize(AuthorizationScopes.post), async (req, res) => {
    const post = await Post.processUpload(req.body.token, req.user);
    res.send(post);
    logger.info('Post created, revalidating cache');
    await i18nRevalidate('/', res);
    logger.info('Cache revalidated');
  });

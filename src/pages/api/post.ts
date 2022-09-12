import { AuthorizationScopes } from '@entities/Jwt';
import { Post } from '@entities/Post';
import { Session } from '@entities/Session';
import { nextConnect } from '@middleware/nextConnect';
import { logger } from '@utils/logger';
import { i18nRevalidate } from '@utils/revalidate';

export default nextConnect()
  .use(Session.authorizeRequest(AuthorizationScopes.post))
  .patch(async (req, res) => {
    await i18nRevalidate('/', res);
  })
  .post(async (req, res) => {
    const token = await Post.requestUploadToken(req.body.location, req.body.title, req.body.date);
    res.send(token);
  })
  .put(async (req, res) => {
    const post = await Post.processUpload(req.body.token);
    res.send(post);
    logger.info('Post created, revalidating cache');
    await i18nRevalidate('/', res);
    logger.info('Cache revalidated');
  });

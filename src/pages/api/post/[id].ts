import { PageConfig } from 'next';
import { AuthorizationScopes } from '../../../entities/Jwt';
import { Post } from '../../../entities/Post';
import { Session } from '../../../entities/Session';
import { nextConnect } from '../../../middleware/nextConnect';
import { logger } from '../../../utils/logger';
import { toString } from '../../../utils/queryParam';
import { i18nRevalidate } from '../../../utils/revalidate';

export default nextConnect()
  .delete(async (req, res) => {
    await Session.authorizeRequest(req, AuthorizationScopes.delete);

    await Post.delete(toString(req.query.id));
    logger.info('Post deleted, revalidating cache');
    await i18nRevalidate('/', res);
    res.end();
  })
  .put(async (req, res) => {
    await Session.authorizeRequest(req, AuthorizationScopes.post);

    const post = await Post.update(toString(req.query.id), req.body);
    logger.info('Post updated, revalidating cache');
    await i18nRevalidate('/', res);
    res.send(post);
  });

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};

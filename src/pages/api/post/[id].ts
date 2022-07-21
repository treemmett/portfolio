import { PageConfig } from 'next';
import { AuthorizationScopes } from '../../../entities/Jwt';
import { Post } from '../../../entities/Post';
import { Session } from '../../../entities/Session';
import { nextConnect } from '../../../middleware/nextConnect';
import { logger } from '../../../utils/logger';
import { toString } from '../../../utils/queryParam';

export default nextConnect()
  .delete(async (req, res) => {
    await Session.authorizeRequest(req, AuthorizationScopes.delete);

    await Post.delete(toString(req.query.id));
    logger.info('Post deleted, revalidating cache');
    await res.revalidate('/');
    res.end();
  })
  .put(async (req, res) => {
    await Session.authorizeRequest(req, AuthorizationScopes.post);

    const post = await Post.update(toString(req.query.id), req.body);
    logger.info('Post updated, revalidating cache');
    await res.revalidate('/');
    res.send(post);
  });

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};

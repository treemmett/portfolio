import { PageConfig } from 'next';
import { Post } from '../../../entities/Post';
import { nextConnect } from '../../../middleware/nextConnect';
import { logger } from '../../../utils/logger';
import { toString } from '../../../utils/queryParam';

export default nextConnect()
  .delete(async (req, res) => {
    await Post.delete(toString(req.query.id));
    logger.info('Post deleted, revalidating cache');
    await res.revalidate('/');
    res.end();
  })
  .put(async (req, res) => {
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

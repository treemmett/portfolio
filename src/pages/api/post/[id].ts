import { Joi, celebrate } from 'celebrate';
import { AuthorizationScopes } from '@entities/Jwt';
import { Post } from '@entities/Post';
import { Session } from '@entities/Session';
import { nextConnect } from '@middleware/nextConnect';
import { logger } from '@utils/logger';

export default nextConnect()
  .use(celebrate({ query: { id: Joi.string().required() } }))
  .delete(Session.authorizeRequest(AuthorizationScopes.delete), async (req, res) => {
    const post = await Post.findOneByOrFail({ id: req.query.id as string });

    if (!post) {
      throw new Error('Post not found');
    }

    await post.remove();

    logger.info('Post deleted, revalidating cache');
    res.end();
  })
  .patch(
    celebrate({ query: { location: [Joi.string(), null] } }),
    Session.authorizeRequest(AuthorizationScopes.post),
    async (req, res) => {
      const post = await Post.findOneByOrFail({ id: req.query.id as string });
      post.created = req.body.created;
      post.location = req.body.location;
      post.title = req.body.title;
      await post.save();
      res.send(post);
    }
  );

import { Joi, celebrate } from 'celebrate';
import { AuthorizationScopes } from '@entities/Jwt';
import { Post } from '@entities/Post';
import { User } from '@entities/User';
import { connectToDatabaseMiddleware } from '@middleware/database';
import { nextConnect } from '@middleware/nextConnect';
import { logger } from '@utils/logger';

export default nextConnect()
  .use(connectToDatabaseMiddleware)
  .use(celebrate({ query: { id: Joi.string().required() } }))
  .delete(User.authorize(AuthorizationScopes.delete), async (req, res) => {
    const post = await Post.getById(req.query.id as string);

    if (!post) {
      throw new Error('Post not found');
    }

    await post.remove();

    logger.info('Post deleted, revalidating cache');
    res.end();
  })
  .patch(
    celebrate({
      query: {
        created: [Joi.string().isoDate(), null],
        id: Joi.optional(),
        location: [Joi.string(), null],
        title: [Joi.string(), null],
      },
    }),
    User.authorize(AuthorizationScopes.post),
    async (req, res) => {
      const post = await Post.getById(req.query.id as string);
      post.created = req.body.created;
      post.location = req.body.location;
      post.title = req.body.title;
      await post.save();
      res.send(post);
    }
  );

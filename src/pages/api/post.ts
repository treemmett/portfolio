import { Joi, celebrate } from 'celebrate';
import { AuthorizationScopes } from '@entities/Jwt';
import { Post } from '@entities/Post';
import { Site } from '@entities/Site';
import { User } from '@entities/User';
import { nextConnect } from '@middleware/nextConnect';
import { logger } from '@utils/logger';
import { i18nRevalidate } from '@utils/revalidate';

export default nextConnect()
  .get(
    celebrate({
      query: {
        username: Joi.string().optional(),
      },
    }),
    async (req, res) => {
      let posts: Post[];
      if (req.query.username) {
        posts = await Post.getAllFromUser(req.query.username as string);
      } else if (req.headers.host) {
        const site = await Site.getByDomain(req.headers.host);
        posts = await Post.getAllFromUser(site.owner.username);
      } else {
        posts = await Post.getAllFromUser('tregan');
      }

      res.send(posts);
    }
  )
  .patch(User.authorize(AuthorizationScopes.post), async (req, res) => {
    await i18nRevalidate('/', res);
  })
  .post(User.authorize(AuthorizationScopes.post), async (req, res) => {
    const token = await Post.requestUploadToken();
    res.send(token);
  })
  .put(
    User.authorize(AuthorizationScopes.post),
    celebrate({
      body: {
        token: Joi.string().required(),
      },
    }),
    async (req, res) => {
      const post = await Post.processUpload(req.body.token, req.user);
      res.send(post);
      logger.info('Post created, revalidating cache');
      await i18nRevalidate('/', res);
      logger.info('Cache revalidated');
    }
  );

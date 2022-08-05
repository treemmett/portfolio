import { PageConfig } from 'next';
import { AuthorizationScopes } from '../../entities/Jwt';
import { Post } from '../../entities/Post';
import { Session } from '../../entities/Session';
import { nextConnect } from '../../middleware/nextConnect';
import { logger } from '../../utils/logger';
import { i18nRevalidate } from '../../utils/revalidate';

export default nextConnect().post(async (req, res) => {
  await Session.authorizeRequest(req, AuthorizationScopes.post);

  const post = await Post.upload(
    req.files?.file.filepath,
    req.body.title,
    req.body.location,
    req.body.date
  );
  logger.info('Post created, revalidating cache');
  await i18nRevalidate('/', res);
  logger.info('Cache revalidated');
  res.json(post);
});

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};

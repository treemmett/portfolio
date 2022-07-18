import { PageConfig } from 'next';
import { Post } from '../../entities/Post';
import { nextConnect } from '../../middleware/nextConnect';
import { logger } from '../../utils/logger';

export default nextConnect().post(async (req, res) => {
  const post = await Post.upload(
    req.files?.file.filepath,
    req.body.title,
    req.body.location,
    req.body.date
  );
  logger.info('Post created, revalidating cache');
  await res.revalidate('/');
  logger.info('Cache revalidated');
  res.json(post);
});

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};

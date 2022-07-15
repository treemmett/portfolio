import { PageConfig } from 'next';
import { Post } from '../../../entities/Post';
import { nextConnect } from '../../../middleware/nextConnect';
import { toString } from '../../../utils/queryParam';

export default nextConnect.delete(async (req, res) => {
  await Post.delete(toString(req.query.id));
  res.end();
});

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};

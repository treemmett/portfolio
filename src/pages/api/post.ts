import { PageConfig } from 'next';
import { Post } from '../../entities/Post';
import { nextConnect } from '../../middleware/nextConnect';

export default nextConnect
  .post(async (req, res) => {
    const post = await Post.upload(
      req.files.file.filepath,
      req.body.title,
      req.body.location,
      req.body.date
    );
    await res.revalidate('/');
    res.json(post);
  })
  .delete(async (req, res) => {
    await Post.delete(req.body.id);
    res.end();
  });

export const config: PageConfig = {
  api: {
    bodyParser: false,
  },
};

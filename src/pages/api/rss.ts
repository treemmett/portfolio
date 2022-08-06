import xml from 'xml';
import { Post } from '../../entities/Post';
import { nextConnect } from '../../middleware/nextConnect';
import { Config } from '../../utils/config';

export default nextConnect().get(async (req, res) => {
  const posts = await Post.getAll();

  const rss = xml(
    {
      rss: [
        { _attr: { version: '2.0', 'xmlns:media': 'http://search.yahoo.com/mrss/' } },
        {
          channel: [
            { title: Config.NEXT_PUBLIC_NAME },
            { link: 'https://tregan.me' },
            { language: req.headers['accept-language'] || 'en-US' },
            ...posts.map((post) => ({
              item: [
                { title: post.title },
                { link: `https://tregan.me/?post=${post.id}` },
                { description: post.location },
                { pubDate: post.created.toUTCString() },
                { guid: post.id },
                ...post.photos.map((photo) => ({
                  enclosure: { _attr: { length: photo.size, type: 'image/webp', url: photo.url } },
                })),
              ],
            })),
          ],
        },
      ],
    },
    { declaration: true }
  );
  res.setHeader('Content-Type', 'application/xml').send(rss);
});

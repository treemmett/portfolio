import xml from 'xml';
import { Post } from '../../entities/Post';
import { nextConnect } from '../../middleware/nextConnect';

export default nextConnect().get(async (req, res) => {
  const posts = await Post.getAll();

  const rss = xml(
    {
      rss: [
        { _attr: { version: '2.0', 'xmlns:media': 'http://search.yahoo.com/mrss/' } },
        {
          channel: [
            { title: 'Tregan' },
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

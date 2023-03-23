import { Site } from '@entities/Site';
import { connectToDatabaseMiddleware } from '@middleware/database';
import { nextConnect } from '@middleware/nextConnect';

export default nextConnect()
  .use(connectToDatabaseMiddleware)
  .get(async (req, res) => {
    const site = await Site.findOne({ where: { domain: req.headers.host } });
    if (site) {
      res.send(site);
    }
    res.status(404).end();
  });

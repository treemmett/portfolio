import { celebrate, Joi } from 'celebrate';
import { AuthorizationScopes } from '@entities/Jwt';
import { Session } from '@entities/Session';
import { Site } from '@entities/Site';
import { connectToDatabaseMiddleware } from '@middleware/database';
import { nextConnect } from '@middleware/nextConnect';

export default nextConnect()
  .use(connectToDatabaseMiddleware)
  .patch(
    Session.authorizeRequest(AuthorizationScopes.post),
    celebrate(
      {
        body: {
          name: Joi.string().required(),
        },
      },
      { allowUnknown: true }
    ),
    async (req, res) => {
      const site = await Site.findOne({ where: { domain: req.headers.host } });
      if (!site) {
        res.status(404).end();
      }
      site.name = req.body.name;
      await site.save();
      res.send(site);
    }
  )
  .get(async (req, res) => {
    const site = await Site.findOne({ where: { domain: req.headers.host } });
    if (site) {
      res.send(site);
    } else {
      res.status(404).end();
    }
  });

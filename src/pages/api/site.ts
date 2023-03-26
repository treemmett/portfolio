import { celebrate, Joi } from 'celebrate';
import { AuthorizationScopes } from '@entities/Jwt';
import { Site } from '@entities/Site';
import { User } from '@entities/User';
import { nextConnect } from '@middleware/nextConnect';

export default nextConnect()
  .patch(
    User.authorize(AuthorizationScopes.post),
    celebrate(
      {
        body: {
          description: [Joi.string(), null, ''],
          facebook: [Joi.string(), null, ''],
          github: [Joi.string(), null, ''],
          imdb: [Joi.string(), null, ''],
          instagram: [Joi.string(), null, ''],
          linkedIn: [Joi.string(), null, ''],
          name: [Joi.string(), null, ''],
          title: [Joi.string(), null, ''],
          twitter: [Joi.string(), null, ''],
        },
      },
      { allowUnknown: true }
    ),
    async (req, res) => {
      const site = await Site.getByUsername(req.user.username);

      site.description = req.body.description || null;
      site.facebook = req.body.facebook || null;
      site.github = req.body.github || null;
      site.imdb = req.body.imdb || null;
      site.instagram = req.body.instagram || null;
      site.linkedIn = req.body.linkedIn || null;
      site.name = req.body.name || null;
      site.title = req.body.title || null;
      site.twitter = req.body.twitter || null;
      await site.save();
      res.send(site);
    }
  )
  .get(celebrate({ query: { username: Joi.string().required() } }), async (req, res) => {
    const site = await Site.getByUsername(req.query.username as string);

    res.send(site);
  });

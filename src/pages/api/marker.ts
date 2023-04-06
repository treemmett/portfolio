import { Joi, celebrate } from 'celebrate';
import { GPSMarker } from '@entities/GPSMarker';
import { AuthorizationScopes } from '@entities/Jwt';
import { Site } from '@entities/Site';
import { User } from '@entities/User';
import { nextConnect } from '@middleware/nextConnect';

export default nextConnect()
  .use(User.authorize(AuthorizationScopes.post))
  .post(
    celebrate({
      body: {
        city: Joi.string().required(),
        country: Joi.string().length(2).required(),
        date: Joi.date().required(),
        lat: Joi.number().required(),
        lng: Joi.number().required(),
      },
    }),
    async (req, res) => {
      const { city, country, date, lat, lng } = req.body;
      const site = await Site.getByUsername(req.user.username);
      const marker = await GPSMarker.checkIn(site, date, lat, lng, country, city);
      res.status(201).send(marker);
    }
  );

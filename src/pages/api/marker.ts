import { Joi, celebrate } from 'celebrate';
import { GPSMarker } from '@entities/GPSMarker';
import { AuthorizationScopes } from '@entities/Jwt';
import { Site } from '@entities/Site';
import { User } from '@entities/User';
import { nextConnect } from '@middleware/nextConnect';

export default nextConnect()
  .get(async (req, res) => {
    const site = await Site.getByDomain(req.headers.host as string);
    const markers = await GPSMarker.getAllForSite(site);

    res.send(markers);
  })
  .post(
    User.authorize(AuthorizationScopes.post),
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
    },
  );

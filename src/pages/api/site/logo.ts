import { Joi, celebrate } from 'celebrate';
import { AuthorizationScopes } from '@entities/Jwt';
import { Photo } from '@entities/Photo';
import { PhotoType } from '@entities/PhotoType';
import { Site } from '@entities/Site';
import { User } from '@entities/User';
import { nextConnect } from '@middleware/nextConnect';

export default nextConnect()
  .use(User.authorize(AuthorizationScopes.post))
  .post(async (req, res) => {
    const token = await Photo.getUploadToken(req.user, PhotoType.LOGO);
    res.send(token);
  })
  .put(
    celebrate({
      body: {
        token: Joi.string().required(),
      },
    }),
    async (req, res) => {
      const site = await Site.getByUsername(req.user.username);
      await site.setLogo(req.body.token);
      res.send(site);
    }
  );

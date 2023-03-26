import { Joi, celebrate } from 'celebrate';
import { serialize } from 'cookie';
import { AuthorizationScopes } from '@entities/Jwt';
import { Site } from '@entities/Site';
import { User } from '@entities/User';
import { nextConnect } from '@middleware/nextConnect';

export default nextConnect()
  .use(User.authorize())
  .get(async (req, res) => {
    res.send(req.user);
  })
  .patch(
    celebrate({
      body: {
        username: Joi.string().optional(),
      },
    }),
    async (req, res) => {
      if (req.body.username) {
        req.user.username = req.body.username;
      }

      await req.user.save();

      if (req.user.scopes.includes(AuthorizationScopes.onboard)) {
        let site = await Site.findOne({ where: { owner: { id: req.user.id } } });
        if (!site) {
          site = new Site();
          site.owner = req.user;
          site.name = req.user.username;
          await site.save();
        }
      }

      const { accessToken, expiration, signature } = await req.user.signAccessToken();

      res.setHeader(
        'Set-Cookie',
        serialize('xsrf-token', signature, {
          expires: expiration,
          httpOnly: true,
          path: '/',
        })
      );
      res.send({ accessToken, user: req.user });
    }
  );

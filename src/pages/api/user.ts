import { Joi, celebrate } from 'celebrate';
import { serialize } from 'cookie';
import { User } from '@entities/User';
import { connectToDatabaseMiddleware } from '@middleware/database';
import { nextConnect } from '@middleware/nextConnect';

export default nextConnect()
  .use(connectToDatabaseMiddleware, User.authorize())
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

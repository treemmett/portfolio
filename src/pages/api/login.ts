import { Joi, celebrate } from 'celebrate';
import { serialize } from 'cookie';
import { User } from '@entities/User';
import { connectToDatabaseMiddleware } from '@middleware/database';
import { nextConnect } from '@middleware/nextConnect';

export default nextConnect().post(
  celebrate({
    body: {
      code: Joi.string().required(),
    },
  }),
  connectToDatabaseMiddleware,
  async (req, res) => {
    const { accessToken, expiration, signature } = await User.authorizeGitHub(req.body.code);

    res.setHeader(
      'Set-Cookie',
      serialize('xsrf-token', signature, {
        expires: expiration,
        httpOnly: true,
        path: '/',
      })
    );
    res.send(accessToken);
  }
);

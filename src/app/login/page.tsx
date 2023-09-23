import { Joi, celebrate } from 'celebrate';
import { serialize } from 'cookie';
import { SignJWT, jwtVerify } from 'jose';
import { Site } from '@entities/Site';
import { User } from '@entities/User';
import { nextConnect } from '@middleware/nextConnect';
import { Config } from '@utils/config';
import { OAuthHandshakeError } from '@utils/errors';

export default nextConnect().get(
  celebrate({
    query: {
      code: Joi.string().optional(),
      state: Joi.string().optional(),
    },
  }),
  async (req, res) => {
    if (req.query.code) {
      if (!req.query.state) {
        throw new OAuthHandshakeError('Missing OAuth state');
      }

      const result = await jwtVerify(
        req.query.state as string,
        new TextEncoder().encode(Config.JWT_SECRET),
      );

      if (result.payload.iss && result.payload.iss !== req.headers.host) {
        const site = await Site.getByDomain(result.payload.iss);
        const url = new URL(
          `${Config.NODE_ENV === 'production' ? 'https' : 'http'}://${site.domain}/api/login/oauth`,
        );
        url.searchParams.set('code', req.query.code as string);
        url.searchParams.set('state', req.query.state as string);
        res.redirect(307, url.toString());
        return;
      }

      const { accessToken, expiration, signature } = await User.authorizeGitHub(
        req.query.code as string,
      );

      res.setHeader(
        'Set-Cookie',
        serialize('xsrf-token', signature, {
          expires: expiration,
          httpOnly: true,
          path: '/',
        }),
      );

      const url = new URL(
        `${Config.NODE_ENV === 'production' ? 'https' : 'http'}://${req.headers.host}/login`,
      );
      url.searchParams.append('accessToken', accessToken);
      res.redirect(307, url.toString());

      return;
    }

    if (!Config.NEXT_PUBLIC_GITHUB_CLIENT_ID) {
      throw new OAuthHandshakeError('Missing client ID');
    }

    const stateToken = new SignJWT({})
      .setAudience('OAUTH')
      .setIssuedAt()
      .setExpirationTime('5m')
      .setProtectedHeader({ alg: 'HS256' });
    if (req.headers.host) {
      stateToken.setIssuer(req.headers.host);
    }

    const url = new URL('https://github.com/login/oauth/authorize');
    url.searchParams.append('client_id', Config.NEXT_PUBLIC_GITHUB_CLIENT_ID);
    url.searchParams.append(
      'state',
      await stateToken.sign(new TextEncoder().encode(Config.JWT_SECRET)),
    );

    res.redirect(307, url.toString());
  },
);

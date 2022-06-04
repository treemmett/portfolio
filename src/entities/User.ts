import { createHash } from 'crypto';
import axios from 'axios';
import { JwtPayload, sign, verify } from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { Config } from '../utils/config';
import { APIError, ErrorCode } from '../utils/errors';

export class User {
  public name: string;

  public static async authorize(code: string) {
    const authResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: Config.NEXT_PUBLIC_GITHUB_CLIENT_ID,
        client_secret: Config.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: 'application/json' }, validateStatus: () => true }
    );

    if (authResponse.status !== 200 || authResponse.data.error) {
      switch (authResponse.data?.error) {
        case 'incorrect_client_credentials':
          throw new APIError(ErrorCode.invalid_auth_secret);
        case 'bad_verification_code':
          throw new APIError(ErrorCode.invalid_auth_code);
        default:
          throw new APIError(ErrorCode.never);
      }
    }

    const { status, data } = await axios.get('https://api.github.com/user', {
      headers: {
        Accept: 'application/json',
        Authorization: `token ${authResponse.data.access_token}`,
      },
      validateStatus: () => true,
    });

    if (status !== 200) {
      throw new APIError(ErrorCode.never);
    }

    if (!Config.AUTHORIZED_USERS.split(',').includes(data.login)) {
      throw new APIError(ErrorCode.unauthorized_user, 403, 'Unauthorized');
    }

    const csrfToken = uuid();

    const expiration = new Date();
    expiration.setDate(expiration.getDate() + 1);

    const accessToken = sign(
      {
        exp: Math.floor(expiration.getTime() / 1000),
        jti: createHash('sha256').update(csrfToken).digest('base64'),
        sub: data.login,
      },
      Config.JWT_SECRET
    );

    return {
      accessToken,
      csrfToken,
      expiration,
    };
  }

  public static authenticateRequest(accessToken: string, csrfToken: string | string[]): User | null;
  public static authenticateRequest(
    accessToken: string,
    csrfToken: string | string[],
    orFail: false
  ): User | null;
  public static authenticateRequest(
    accessToken: string,
    csrfToken: string | string[],
    orFail: true
  ): User;
  public static authenticateRequest(
    accessToken: string,
    csrfToken: string | string[],
    orFail?: boolean
  ): User | null {
    const csrf = Array.isArray(csrfToken) ? csrfToken[0] : csrfToken;

    if (!accessToken || !csrf) {
      if (orFail) {
        throw new APIError(ErrorCode.unauthorized, 401, 'Unauthenticated request');
      }

      return null;
    }

    let sub: string;
    let jti: string;
    try {
      ({ sub, jti } = verify(accessToken, Config.JWT_SECRET) as JwtPayload);
    } catch {
      if (orFail) {
        throw new APIError(ErrorCode.bad_access_token, 401, 'Invalid session');
      }

      return null;
    }

    const csrfHash = createHash('sha256').update(csrf).digest('base64');

    // confirm csrf token;
    if (csrfHash !== jti) {
      if (orFail) {
        throw new APIError(ErrorCode.csrf_forgery, 401, 'Invalid session');
      }

      return null;
    }

    const u = new User();
    u.name = sub;
    return u;
  }
}

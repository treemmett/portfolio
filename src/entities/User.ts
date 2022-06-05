import axios from 'axios';
import { sign, verify } from 'jsonwebtoken';
import { Config } from '../utils/config';
import { APIError, ErrorCode } from '../utils/errors';
import { AuthorizationScopes, Jwt } from './Jwt';

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

    const expiration = new Date();
    expiration.setDate(expiration.getDate() + 1);

    const jwt: Jwt = {
      exp: Math.floor(expiration.getTime() / 1000),
      scp: [AuthorizationScopes.post],
      sub: data.login,
    };

    const accessTokenParts = sign(jwt, Config.JWT_SECRET).split('.');

    const signature = accessTokenParts.pop();

    return {
      accessToken: accessTokenParts.join('.'),
      expiration,
      signature,
    };
  }

  public static authenticateRequest(accessToken: string, signature: string): User | null;
  public static authenticateRequest(
    accessToken: string,
    signature: string,
    orFail: false
  ): User | null;
  public static authenticateRequest(accessToken: string, signature: string, orFail: true): User;
  public static authenticateRequest(
    accessToken: string,
    signature: string,
    orFail?: boolean
  ): User | null {
    const match = /^Bearer (\S+)/i.exec(accessToken);

    const token = match ? match[1] : accessToken;

    if (!token || !signature) {
      if (orFail) {
        throw new APIError(ErrorCode.unauthorized, 401, 'Unauthenticated request');
      }

      return null;
    }

    let sub: string;
    try {
      ({ sub } = verify([token, signature].join('.'), Config.JWT_SECRET) as Jwt);
    } catch {
      if (orFail) {
        throw new APIError(ErrorCode.bad_access_token, 401, 'Invalid session');
      }

      return null;
    }

    const u = new User();
    u.name = sub;
    return u;
  }
}

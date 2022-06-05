import { verify } from 'jsonwebtoken';
import { Config } from '../utils/config';
import { APIError, ErrorCode } from '../utils/errors';
import { Jwt } from './Jwt';

export class User {
  public name: string;

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

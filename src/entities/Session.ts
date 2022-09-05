import { jwtVerify, decodeJwt } from 'jose';
import { NextApiRequest, NextApiResponse } from 'next';
import { Middleware } from 'next-connect';
import { Config } from '../utils/config';
import { APIError, ErrorCode } from '../utils/errors';
import { isBrowser } from '../utils/isBrowser';
import { ACCESS_TOKEN_STORAGE_KEY, AuthorizationScopes, Jwt } from './Jwt';

function decodeToken(accessToken: string): Jwt {
  return decodeJwt(accessToken) as unknown as Jwt;
}

export class Session {
  public expiration?: Date;

  public scope?: AuthorizationScopes[] = [];

  public username?: string;

  public authorizing = false;

  constructor(public accessToken?: string) {
    if (!accessToken) return;

    const { exp, scp, sub } = decodeToken(accessToken);

    this.expiration = new Date(exp * 1000);
    this.scope = scp;
    this.username = sub;
  }

  public static async fromRequest(req: NextApiRequest): Promise<Session> {
    if (isBrowser()) {
      throw new Error('Authorization cannot be asserted on client');
    }

    const signature = req.cookies['xsrf-token'];
    const match = /^Bearer (\S+)/i.exec(req.headers.authorization);

    if (!signature || !match || !match[1]) {
      return new Session();
    }

    try {
      await jwtVerify(match[1] + signature, new TextEncoder().encode(Config.JWT_SECRET));
    } catch {
      throw new APIError(ErrorCode.bad_access_token);
    }

    return new Session(match[1]);
  }

  public static authorizeRequest(
    scope: AuthorizationScopes
  ): Middleware<NextApiRequest, NextApiResponse> {
    return async (req, res, next) => {
      const session = await this.fromRequest(req);
      session.authorize(scope);
      next();
    };
  }

  public static restore(): Session {
    if (!isBrowser()) return new Session();

    return new Session(localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY));
  }

  public authorize(scope: AuthorizationScopes): void {
    if (!this.isValid()) {
      throw new APIError(ErrorCode.unauthenticated);
    }

    if (!this.hasPermission(scope)) {
      throw new APIError(ErrorCode.unauthorized);
    }
  }

  public hasPermission(scope: AuthorizationScopes): boolean {
    if (!this.isValid()) return false;

    return this.scope.includes(scope);
  }

  public isValid(): boolean {
    return this.username && new Date() < this.expiration;
  }

  public startAuthorization(): this {
    this.authorizing = true;
    return this;
  }
}

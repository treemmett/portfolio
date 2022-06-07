import { decode } from 'jsonwebtoken';
import { isBrowser } from '../utils/isBrowser';
import { ACCESS_TOKEN_STORAGE_KEY, AuthorizationScopes, Jwt } from './Jwt';

export class Session {
  public expiration?: Date;

  public scope?: AuthorizationScopes[] = [];

  public username?: string;

  constructor(public accessToken?: string) {
    if (!accessToken) return;

    const { exp, scp, sub } = decode(accessToken) as Jwt;

    this.expiration = new Date(exp * 1000);
    this.scope = scp;
    this.username = sub;
  }

  public static restore(): Session {
    if (!isBrowser()) return new Session();

    return new Session(localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY));
  }
}

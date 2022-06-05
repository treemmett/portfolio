import { decode } from 'jsonwebtoken';
import { AuthorizationScopes, Jwt } from './Jwt';

export class Session {
  public expiration: Date;

  public scope: AuthorizationScopes[] = [];

  public username: string;

  constructor(public accessToken: string) {
    const { exp, scp, sub } = decode(accessToken) as Jwt;

    this.expiration = new Date(exp * 1000);
    this.scope = scp;
    this.username = sub;
  }
}

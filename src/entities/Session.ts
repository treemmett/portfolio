import { isBrowser } from '../utils/isBrowser';
import { ACCESS_TOKEN_STORAGE_KEY, AuthorizationScopes, Jwt } from './Jwt';

function decodeToken(accessToken: string): Jwt {
  const [, payload] = accessToken.split('.');
  const json = window.atob(payload);
  return JSON.parse(json);
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

  public static restore(): Session {
    if (!isBrowser()) return new Session();

    return new Session(localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY));
  }

  public static authorize(): Session {
    const s = new Session();
    s.authorizing = true;
    return s;
  }

  public hasPermission(scope: AuthorizationScopes): boolean {
    if (!this.isValid()) return false;

    return this.scope.includes(scope);
  }

  public isValid(): boolean {
    return new Date() < this.expiration;
  }
}

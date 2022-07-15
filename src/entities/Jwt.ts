export enum AuthorizationScopes {
  delete = 'delete',
  post = 'post',
}

export interface Jwt {
  exp: number;
  scp: AuthorizationScopes[];
  sub: string;
}

export const ACCESS_TOKEN_STORAGE_KEY = '_a.';

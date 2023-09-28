export enum AuthorizationScopes {
  delete = 'delete',
  onboard = 'onboard',
  post = 'post',
}

export interface AccessTokenMeta {
  githubId?: number;
}

export interface Jwt {
  exp: number;
  scp: AuthorizationScopes[];
  sub: string;
  meta?: AccessTokenMeta;
}

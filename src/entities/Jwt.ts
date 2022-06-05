export enum AuthorizationScopes {
  post = 'post',
}

export interface Jwt {
  exp: number;
  scp: AuthorizationScopes[];
  sub: string;
}

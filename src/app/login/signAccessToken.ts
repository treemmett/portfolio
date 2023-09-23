import { SignJWT } from 'jose';
import { AccessTokenMeta, AuthorizationScopes } from '@entities/Jwt';
import { Config } from '@utils/config';

export async function signAccessToken(
  id: string,
  scopes?: AuthorizationScopes[],
  meta?: AccessTokenMeta,
) {
  const expiration = new Date();
  expiration.setDate(expiration.getDate() + Config.NODE_ENV === 'production' ? 1 : 365);

  const scp = new Set<AuthorizationScopes>();

  // onboarding users don't have any perms
  if (!scopes?.includes(AuthorizationScopes.onboard)) {
    scp.add(AuthorizationScopes.delete);
    scp.add(AuthorizationScopes.post);
  }

  if (scopes) {
    scopes.forEach((s) => scp.add(s));
  }

  const token = await new SignJWT({ meta, scp: scopes })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(Math.floor(expiration.getTime() / 1000))
    .setSubject(id)
    .sign(new TextEncoder().encode(Config.JWT_SECRET));

  const accessTokenParts = token.split('.');
  const signature = accessTokenParts.pop() as string;
  accessTokenParts.push('');

  return {
    accessToken: accessTokenParts.join('.'),
    expiration,
    signature,
  };
}

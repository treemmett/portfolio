import { SignJWT } from 'jose';
import { AccessTokenMeta, AuthorizationScopes } from '@app/scopes';
import { Config } from '@utils/config';

export async function signAccessToken(
  id: string,
  scopes?: AuthorizationScopes[],
  meta?: AccessTokenMeta,
) {
  const expiration = new Date();
  expiration.setDate(expiration.getDate() + Config.NODE_ENV === 'production' ? 1 : 365);

  const scopeSet = new Set<AuthorizationScopes>(scopes);

  // onboarding users don't have any perms
  if (!scopes?.includes(AuthorizationScopes.onboard)) {
    scopeSet.add(AuthorizationScopes.delete);
    scopeSet.add(AuthorizationScopes.post);
  }

  if (scopes) {
    scopes.forEach((s) => scopeSet.add(s));
  }

  const scp = [...scopeSet];

  const token = await new SignJWT({ meta, scp })
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
    scope: scp,
    signature,
  };
}

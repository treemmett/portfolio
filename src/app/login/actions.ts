'use server';

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { authorizeGithub } from './authorizeGithub';
import { getUser } from '@app/getUser';
import { Config } from '@utils/config';
import { OAuthHandshakeError } from '@utils/errors';

export async function getCurrentUser() {
  const user = await getUser();
  return { id: user.id, username: user.username };
}

export async function login(code?: string, state?: string) {
  if (!code) {
    const url = new URL('https://github.com/login/oauth/authorize');
    url.searchParams.append('client_id', Config.NEXT_PUBLIC_GITHUB_CLIENT_ID);
    url.searchParams.append(
      'state',
      await new SignJWT({})
        .setAudience('OAUTH')
        .setIssuedAt()
        .setExpirationTime('5m')
        .setProtectedHeader({ alg: 'HS256' })
        .sign(new TextEncoder().encode(Config.JWT_SECRET)),
    );
    redirect(url.toString());
  }

  if (!state) {
    throw new OAuthHandshakeError('Missing OAuth state');
  }

  try {
    await jwtVerify(state, new TextEncoder().encode(Config.JWT_SECRET));
  } catch {
    throw new OAuthHandshakeError('Bad OAuth state');
  }

  const { accessToken, expiration, signature } = await authorizeGithub(code);
  cookies().set({ expires: expiration, name: 'accessToken', value: accessToken });
  cookies().set({ expires: expiration, httpOnly: true, name: 'signature', value: signature });
  return true;
}

export async function logout() {
  cookies().delete('accessToken');
  cookies().delete('signature');
}

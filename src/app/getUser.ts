import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { AuthorizationScopes, Jwt } from '@app/scopes';
import { Config } from '@utils/config';
import {
  BadAccessTokenError,
  UnauthenticatedError,
  UnauthorizedError,
  UserNotFoundError,
} from '@utils/errors';
import { prisma } from '@utils/prisma';

export async function getUser(...scopes: AuthorizationScopes[]) {
  const accessToken = cookies().get('accessToken');
  const signature = cookies().get('signature');

  if (!signature || !accessToken) {
    throw new UnauthenticatedError();
  }

  let jwt: Jwt;
  try {
    const result = await jwtVerify(
      accessToken.value + signature.value,
      new TextEncoder().encode(Config.JWT_SECRET),
    );

    jwt = result.payload as unknown as Jwt;
  } catch {
    throw new BadAccessTokenError();
  }

  if (!scopes.every((s) => jwt.scp?.includes(s))) {
    throw new UnauthorizedError();
  }

  const user = await prisma.user.findUnique({ include: { sites: true }, where: { id: jwt.sub } });

  if (!user) {
    throw new UserNotFoundError();
  }

  return user;
}

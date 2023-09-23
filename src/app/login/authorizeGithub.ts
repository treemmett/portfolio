import axios from 'axios';
import { v4 } from 'uuid';
import { signAccessToken } from './signAccessToken';
import { AuthorizationScopes } from '@entities/Jwt';
import { Config } from '@utils/config';
import { OAuthHandshakeError } from '@utils/errors';
import { logger } from '@utils/logger';
import { prisma } from '@utils/prisma';

export async function authorizeGithub(code: string) {
  const authResponse = await axios.post<
    | {
        access_token: string;
        token_type: string;
        scope: string;
      }
    | {
        error: string;
        error_description: string;
        error_uri: string;
      }
  >(
    'https://github.com/login/oauth/access_token',
    {
      client_id: Config.NEXT_PUBLIC_GITHUB_CLIENT_ID,
      client_secret: Config.GITHUB_CLIENT_SECRET,
      code,
    },
    { headers: { Accept: 'application/json' }, validateStatus: () => true },
  );

  if (authResponse.status !== 200 || 'error' in authResponse.data) {
    logger.error({ response: authResponse.data }, 'OAuth handshake failed');

    if (!('error' in authResponse.data)) {
      throw new OAuthHandshakeError();
    }

    switch (authResponse.data?.error) {
      case 'incorrect_client_credentials':
        throw new OAuthHandshakeError('Bad OAuth secret');
      case 'bad_verification_code':
        throw new OAuthHandshakeError('Bad OAuth code');
      default:
        throw new OAuthHandshakeError();
    }
  }

  const { status, data } = await axios.get<{
    login: string;
    id: number;
    avatar_url: string;
    name: string;
  }>('https://api.github.com/user', {
    headers: {
      Accept: 'application/json',
      Authorization: `token ${authResponse.data.access_token}`,
    },
    validateStatus: () => true,
  });

  if (status !== 200) {
    throw new OAuthHandshakeError();
  }

  const user = await prisma.user.findUnique({ where: { githubId: data.id } });
  if (user) {
    return signAccessToken(user.id);
  }

  return signAccessToken(v4(), [AuthorizationScopes.onboard], { githubId: data.id });
}

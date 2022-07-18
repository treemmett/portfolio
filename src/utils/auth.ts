import axios from 'axios';
import { sign } from 'jsonwebtoken';
import { AuthorizationScopes, Jwt } from '../entities/Jwt';
import { Config } from './config';
import { APIError, ErrorCode } from './errors';

export async function authorizeGitHub(code: string) {
  const authResponse = await axios.post(
    'https://github.com/login/oauth/access_token',
    {
      client_id: Config.NEXT_PUBLIC_GITHUB_CLIENT_ID,
      client_secret: Config.GITHUB_CLIENT_SECRET,
      code,
    },
    { headers: { Accept: 'application/json' }, validateStatus: () => true }
  );

  if (authResponse.status !== 200 || authResponse.data.error) {
    switch (authResponse.data?.error) {
      case 'incorrect_client_credentials':
        throw new APIError(ErrorCode.invalid_auth_secret);
      case 'bad_verification_code':
        throw new APIError(ErrorCode.invalid_auth_code);
      default:
        throw new APIError(ErrorCode.never);
    }
  }

  const { status, data } = await axios.get('https://api.github.com/user', {
    headers: {
      Accept: 'application/json',
      Authorization: `token ${authResponse.data.access_token}`,
    },
    validateStatus: () => true,
  });

  if (status !== 200) {
    throw new APIError(ErrorCode.never);
  }

  const scopes: AuthorizationScopes[] = [];

  if (Config.AUTHORIZED_USERS.split(',').includes(data.login)) {
    scopes.push(AuthorizationScopes.delete, AuthorizationScopes.post);
  }

  const expiration = new Date();
  expiration.setDate(expiration.getDate() + Config.NODE_ENV === 'production' ? 1 : 365);

  const jwt: Jwt = {
    exp: Math.floor(expiration.getTime() / 1000),
    scp: scopes,
    sub: data.login,
  };

  const accessTokenParts = sign(jwt, Config.JWT_SECRET).split('.');
  const signature = accessTokenParts.pop();
  accessTokenParts.push('');

  return {
    accessToken: accessTokenParts.join('.'),
    expiration,
    signature,
  };
}

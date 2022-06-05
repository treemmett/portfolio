import axios from 'axios';
import { sign } from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import { Middleware } from 'next-connect';
import { AuthorizationScopes, Jwt } from '../entities/Jwt';
import { User } from '../entities/User';
import { Config } from './config';
import { APIError, ErrorCode } from './errors';

export const ACCESS_TOKEN_STORAGE_KEY = '_a.';

export function getAuthToken(): null | { token: string; expiration: Date } {
  try {
    const storageValue = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    const { token, expiration } = JSON.parse(storageValue);
    if (!token || !expiration) return null;

    return { expiration: new Date(expiration), token };
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  const token = getAuthToken();
  if (!token) return false;

  return new Date() < token.expiration;
}

export const authenticate: Middleware<NextApiRequest, NextApiResponse> = (req, res, next) => {
  if (req.method?.toLowerCase() !== 'get') {
    const signature = req.cookies['xsrf-token'];

    User.authenticateRequest(req.headers.authorization, signature, true);
  }

  next();
};

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

  if (!Config.AUTHORIZED_USERS.split(',').includes(data.login)) {
    throw new APIError(ErrorCode.unauthorized_user, 403, 'Unauthorized');
  }

  const expiration = new Date();
  expiration.setDate(expiration.getDate() + 1);

  const jwt: Jwt = {
    exp: Math.floor(expiration.getTime() / 1000),
    scp: [AuthorizationScopes.post],
    sub: data.login,
  };

  const accessTokenParts = sign(jwt, Config.JWT_SECRET).split('.');

  const signature = accessTokenParts.pop();

  return {
    accessToken: accessTokenParts.join('.'),
    expiration,
    signature,
  };
}

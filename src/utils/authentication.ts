import { NextApiRequest, NextApiResponse } from 'next';
import { Middleware } from 'next-connect';
import { User } from '../entities/User';

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

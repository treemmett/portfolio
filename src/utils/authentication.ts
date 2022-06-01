import { NextApiRequest, NextApiResponse } from 'next';
import { Middleware } from 'next-connect';
import { User } from '../entities/User';

export const CSRF_STORAGE_KEY = '_a.';

export function getCsrfToken(): null | { token: string; expiration: Date } {
  try {
    const storageValue = localStorage.getItem(CSRF_STORAGE_KEY);
    const { token, expiration } = JSON.parse(storageValue);
    if (!token || !expiration) return null;

    return { expiration: new Date(expiration), token };
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  const token = getCsrfToken();
  if (!token) return false;

  return new Date() < token.expiration;
}

export const authenticate: Middleware<NextApiRequest, NextApiResponse> = (req, res, next) => {
  if (req.method?.toLowerCase() !== 'get') {
    const csrfToken = req.headers['x-csrf-token'];
    const accessToken = req.cookies.token;
    User.authenticateRequest(accessToken, csrfToken, true);
  }

  next();
};

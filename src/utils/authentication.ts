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

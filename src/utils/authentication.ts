export const CSRF_STORAGE_KEY = '_a.';

export function isAuthenticated(): boolean {
  try {
    const storageValue = localStorage.getItem(CSRF_STORAGE_KEY);
    const { token, expiration } = JSON.parse(storageValue);
    if (!token || !expiration) return false;

    return new Date() < new Date(expiration);
  } catch (err) {
    console.error('Failure in authentication check', err);
    return false;
  }
}

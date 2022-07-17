import { randomBytes } from 'crypto';

export function randomID(length = 8): string {
  let id = '';

  while (id.length < 12) {
    id = randomBytes(12)
      .toString('base64')
      .replaceAll(/(\/|=|\+)/g, '')
      .substring(0, length)
      .toUpperCase();
  }

  return id;
}

export function ensureUniqueID(set: string[]): string;
export function ensureUniqueID<T = unknown>(set: T[], idFn: (each: T) => string): string;
export function ensureUniqueID<T = unknown>(
  set: Array<T | string>,
  idFn?: (each: T) => string
): string {
  const id = randomID();

  if (
    set.some((i) => {
      if (typeof i === 'string') {
        return i === id;
      }

      return idFn(i) === id;
    })
  ) {
    return ensureUniqueID(set, idFn);
  }

  return id;
}

import { isBrowser } from './isBrowser';

export function toPx(px?: number): string {
  if (!px) return '0px';

  return `${px}px`;
}

/**
 * Checks if system is running in dark-mode
 */
export function isDarkMode(): boolean {
  if (!isBrowser()) return false;

  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/**
 * Subscribe to system color theme changes
 * @param listener Callback when theme changes
 * @returns Unsubscribe callback
 */
export function listenForDarkModeChange(listener: (isDarkMode: boolean) => void): () => void {
  const handler = (e: MediaQueryListEvent) => {
    listener(e.matches);
  };

  const query = window.matchMedia('(prefers-color-scheme: dark)');

  query.addEventListener('change', handler);
  return () => query.removeEventListener('change', handler);
}

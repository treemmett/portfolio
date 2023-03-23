import { apiClient } from './apiClient';
import { isBrowser } from './isBrowser';

/**
 * Get the current host, including the protocol, origin and port (if any).
 *
 * Does **not** end with a trailing "/".
 */
function getHost() {
  return `${window.location.protocol}//${window.location.host}`;
}

function isReferrerSameHost(): boolean {
  if (!isBrowser()) {
    return false;
  }
  const r = document.referrer || '';
  const host = getHost();

  return r.substring(0, host.length) === host;
}

/**
 * Track the referrer on the current page, or `<none>` if the page has no referrer.
 */
function referrer() {
  if (!isBrowser()) {
    return '<not-in-browser>';
  }
  if (isReferrerSameHost()) {
    return '<none>';
  }

  return document.referrer || '<none>';
}

/**
 * Track the screen type of the current user, based on window size:
 *
 * - width <= 414: XS -> phone
 * - width <= 800: S -> tablet
 * - width <= 1200: M -> small laptop
 * - width <= 1600: L -> large laptop
 * - width > 1440: XL -> large desktop
 */
function screenType() {
  if (!isBrowser()) {
    return '<not-in-browser>';
  }
  const width = window.innerWidth;
  if (width <= 414) return 'XS';
  if (width <= 800) return 'S';
  if (width <= 1200) return 'M';
  if (width <= 1600) return 'L';
  return 'XL';
}

export function trace(event: string, parameters?: Record<string, string | undefined>) {
  apiClient
    .post('/blimp', {
      event,
      parameters: {
        ...parameters,
        referrer: referrer(),
        screenType: screenType(),
      },
    })
    .then(() => null)
    .catch(() => null);
}

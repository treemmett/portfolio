import { apiClient } from './apiClient';
import { isBrowser } from './isBrowser';
import type { InsightsRequest } from '@pages/api/blimp';

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
    return { type: 'referrer', value: '<not-in-browser>' };
  }
  if (isReferrerSameHost()) {
    return { type: 'referrer', value: '<none>' };
  }

  return { type: 'referrer', value: document.referrer || '<none>' };
}

function getScreenType() {
  const width = window.innerWidth;
  if (width <= 414) return 'XS';
  if (width <= 800) return 'S';
  if (width <= 1200) return 'M';
  if (width <= 1600) return 'L';
  return 'XL';
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
    return { type: 'screen-type', value: '<not-in-browser>' };
  }
  return { type: 'screen-type', value: getScreenType() };
}

export function trace(id: string, parameters?: InsightsRequest['parameters']) {
  apiClient
    .post('/blimp', {
      id,
      parameters: {
        ...parameters,
        referrer: referrer(),
        screenType: screenType(),
      },
    })
    .then(() => null)
    .catch(() => null);
}

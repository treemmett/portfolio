import { isBrowser } from './isBrowser';

export function toPx(px: number): string {
  return `${px}px`;
}

export function scaleDimensions(
  w: number,
  h: number,
  scale: { h: number },
  constrainToElement?: HTMLElement,
  padding?: number
): [w: number, h: number];
export function scaleDimensions(
  w: number,
  h: number,
  scale: { w: number },
  constrainToElement?: HTMLElement,
  padding?: number
): [w: number, h: number];
export function scaleDimensions(
  w: number,
  h: number,
  scale: { h?: number; w?: number },
  constrainToElement?: HTMLElement,
  padding = 0
): [w: number, h: number] {
  let width = w;
  let height = h;

  if (scale.h) {
    width = (scale.h * w) / h;
    height = scale.h;
  }

  if (scale.w) {
    width = scale.w;
    height = (scale.w * h) / w;
  }

  if (constrainToElement) {
    const { clientHeight, clientWidth } = constrainToElement;
    const { paddingBottom, paddingLeft, paddingRight, paddingTop } =
      getComputedStyle(constrainToElement);

    const maximumHeight =
      clientHeight - parseFloat(paddingBottom) - parseFloat(paddingTop) - padding;
    if (height > maximumHeight)
      return scaleDimensions(width, height, { h: maximumHeight }, constrainToElement);

    const maximumWidth = clientWidth - parseFloat(paddingLeft) - parseFloat(paddingRight) - padding;
    if (width > maximumWidth)
      return scaleDimensions(width, height, { w: maximumWidth }, constrainToElement);
  }

  return [width, height];
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

export function getRemValue(): number {
  if (isBrowser()) {
    return parseFloat(getComputedStyle(document.documentElement).fontSize);
  }

  return 0;
}

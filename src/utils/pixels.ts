import screen from '../styles/screen.module.scss';

export function getRemValue(): number {
  if (typeof window !== 'undefined') {
    return parseFloat(getComputedStyle(document.documentElement).fontSize);
  }

  return 0;
}

export function toPx(px: number): string {
  return `${px}px`;
}

export function pxToNumber(string: string): number {
  if (!string) return 0;

  return Number(string.replace(/px$/, ''));
}

export const smMin = pxToNumber(screen.smMin);
export const mdMin = pxToNumber(screen.mdMin);
export const lgMin = pxToNumber(screen.lgMin);
export const xlMin = pxToNumber(screen.xlMin);

export function scaleDimensions(w: number, h: number, scale: { h: number }): [w: number, h: number];
export function scaleDimensions(w: number, h: number, scale: { w: number }): [w: number, h: number];
export function scaleDimensions(
  w: number,
  h: number,
  scale: { h?: number; w?: number }
): [w: number, h: number] {
  if (scale.h) {
    return [(scale.h * w) / h, scale.h];
  }

  if (scale.w) {
    return [scale.w, (scale.w * h) / w];
  }

  return [w, h];
}

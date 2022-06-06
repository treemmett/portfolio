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

export function scaleDimensions(
  w: number,
  h: number,
  scale: { h: number },
  constrainToElement?: HTMLElement
): [w: number, h: number];
export function scaleDimensions(
  w: number,
  h: number,
  scale: { w: number },
  constrainToElement?: HTMLElement
): [w: number, h: number];
export function scaleDimensions(
  w: number,
  h: number,
  scale: { h?: number; w?: number },
  constrainToElement?: HTMLElement
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

    const maximumHeight = clientHeight - parseFloat(paddingBottom) - parseFloat(paddingTop);
    if (height > maximumHeight)
      return scaleDimensions(width, height, { h: maximumHeight }, constrainToElement);

    const maximumWidth = clientWidth - parseFloat(paddingLeft) - parseFloat(paddingRight);
    if (width > maximumWidth)
      return scaleDimensions(width, height, { w: maximumWidth }, constrainToElement);
  }

  return [width, height];
}

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

export function getRemValue(): number {
  if (typeof window !== 'undefined') {
    return parseFloat(getComputedStyle(document.documentElement).fontSize);
  }

  return 0;
}

export function toPx(px: number): string {
  return `${px}px`;
}

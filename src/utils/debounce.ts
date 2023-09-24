/* eslint-disable @typescript-eslint/no-explicit-any */

export function debounce(
  func: (...params: any[]) => void,
  wait: number,
): (...params: any[]) => void {
  let timeout: NodeJS.Timeout;

  return (...params: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...(params as []));
    }, wait);
  };
}

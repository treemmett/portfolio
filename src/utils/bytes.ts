export function formatBytes(bytes: number, si = true, dp = 1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return `${bytes} B`;
  }

  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  let u = -1;
  const r = 10 ** dp;

  let b = bytes;

  do {
    b /= thresh;
    u += 1;
  } while (Math.round(Math.abs(b) * r) / r >= thresh && u < units.length - 1);

  return `${b.toFixed(dp)} ${units[u]}`;
}

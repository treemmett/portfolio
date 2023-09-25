export const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) {
    throw new Error('Invalid date');
  }

  return `${d.getUTCDate()} ${months[d.getUTCMonth()]}, ${d.getFullYear()}`;
}

export function trimTime(date: string | Date) {
  const d = date instanceof Date ? date.toISOString() : date;

  return d.split('T')[0];
}

export function toLocalString(date: Date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, -1);
}

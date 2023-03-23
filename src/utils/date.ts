import { i18n } from 'next-i18next';

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

  if (!i18n) throw new Error('i18n not initialized');

  return `${d.getUTCDate()} ${i18n.t(months[d.getUTCMonth()])}, ${d.getUTCFullYear()}`;
}

export function trimTime(date: string | Date) {
  const d = date instanceof Date ? date.toISOString() : date;

  return d.split('T')[0];
}

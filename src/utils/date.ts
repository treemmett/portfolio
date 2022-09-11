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

export function formatDate(date: Date): string {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) {
    throw new Error('Invalid date');
  }

  return `${d.getDate()} ${i18n.t(months[d.getMonth()])}, ${d.getFullYear()}`;
}

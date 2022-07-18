const { resolve } = require('path');

/** @type {import('next-i18next').InternalConfig} */
module.exports = {
  /** @type {import('next').NextConfig['i18n']} */
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr'],
  },
  localePath: resolve('./public/locales'),
};

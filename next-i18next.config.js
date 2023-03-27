/** @type {import('next-i18next').UserConfig} */
module.exports = {
  /** @type {import('next').NextConfig['i18n']} */
  i18n: {
    defaultLocale: 'en',
    locales: ['de', 'en', 'et', 'fr', 'sv'],
  },
  localePath: './public/locales',
};

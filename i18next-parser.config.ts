import { UserConfig } from 'i18next-parser';
import nextI18nextConfig from './next-i18next.config';

const config: UserConfig = {
  createOldCatalogs: false,
  defaultNamespace: 'common',
  locales: nextI18nextConfig.i18n.locales,
  output: 'public/locales/$LOCALE/$NAMESPACE.json',
  sort: true,
};

export default config;

import { NextApiResponse } from 'next';
import { i18n } from '../../next-i18next.config';
import { logger } from './logger';

export async function i18nRevalidate(urlPath: string, res: NextApiResponse): Promise<void> {
  await Promise.all(
    [urlPath, ...i18n.locales.map((locale) => `/${locale}${urlPath}`.replace(/(\/*$)/, ''))].map(
      async (path) => {
        logger.info('Revalidating', path);
        await res.revalidate(path);
        logger.info('Revalidation successful', path);
      }
    )
  );
}

import { NextApiResponse } from 'next';
import { logger } from './logger';

export async function i18nRevalidate(path: string, res: NextApiResponse): Promise<void> {
  logger.info('Revalidating', path);
  res
    .revalidate(path)
    .catch((err) => logger.error('Revalidation failed', err, { path }))
    .then(() => logger.info('Revalidation successful', path));
}

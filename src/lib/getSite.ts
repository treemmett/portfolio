import { notFound } from 'next/navigation';
import { cache } from 'react';
import { Config } from '@utils/config';
import { prisma } from '@utils/prisma';

export const getSite = cache(async () => {
  const site = await prisma.site.findFirst({ where: { users: { username: Config.DEFAULT_USER } } });

  if (!site) notFound();

  return site;
});

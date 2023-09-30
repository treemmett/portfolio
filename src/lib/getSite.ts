import { notFound } from 'next/navigation';
import { Config } from '@utils/config';
import { prisma } from '@utils/prisma';

export async function getSite() {
  const site = await prisma.site.findFirst({ where: { users: { username: Config.DEFAULT_USER } } });

  if (!site) notFound();

  return site;
}

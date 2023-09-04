import { prisma } from '@utils/prisma';

export function getSite(username: string) {
  return prisma.sites.findFirst({ where: { users: { username } } });
}

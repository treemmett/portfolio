import { prisma } from '@utils/prisma';

export function getSite() {
  return prisma.sites.findFirst({ where: { users: { username: 'tregan' } } });
}

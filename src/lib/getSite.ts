import { prisma } from '@utils/prisma';

export function getSite() {
  return prisma.site.findFirst({ where: { users: { username: 'tregan' } } });
}

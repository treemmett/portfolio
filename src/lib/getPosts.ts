import { Config } from '@utils/config';
import { prisma } from '@utils/prisma';

export function getPosts() {
  return prisma.post.findMany({
    include: { photo: true, user: true },
    orderBy: {
      created: 'desc',
    },
    where: { user: { username: Config.DEFAULT_USER } },
  });
}

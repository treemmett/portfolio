import { prisma } from '@utils/prisma';

export function getPosts(username: string) {
  return prisma.post.findMany({
    include: { photo: true, user: true },
    where: { user: { username } },
  });
}

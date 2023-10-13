import { Config } from '@utils/config';
import { prisma } from '@utils/prisma';

export async function getPosts() {
  const posts = await prisma.post.findMany({
    include: { photo: true, user: true },
    orderBy: {
      created: 'desc',
    },
    where: { user: { username: Config.DEFAULT_USER } },
  });

  return posts.map((post) => ({
    ...post,
    photo: {
      ...post.photo,
      url: Config.CDN_URL
        ? `${Config.CDN_URL}/${post.photo?.id}`
        : `${Config.S3_URL}/${Config.S3_BUCKET}/${post.photo?.id}`,
    },
  }));
}

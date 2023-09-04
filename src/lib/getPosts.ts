import { Config } from '@utils/config';
import { prisma } from '@utils/prisma';

export async function getPosts(username: string) {
  const posts = await prisma.posts.findMany({
    include: { photo: true, user: true },
    where: { user: { username } },
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

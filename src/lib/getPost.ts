import { Config } from '@utils/config';
import { prisma } from '@utils/prisma';

export async function getPost(id: string, username: string) {
  const post = await prisma.posts.findFirst({
    include: { photo: true, user: true },
    where: { id, user: { username } },
  });

  if (!post) return null;

  return {
    ...post,
    photo: {
      ...post.photo,
      url: Config.CDN_URL
        ? `${Config.CDN_URL}/${post.photo?.id}`
        : `${Config.S3_URL}/${Config.S3_BUCKET}/${post.photo?.id}`,
    },
  };
}
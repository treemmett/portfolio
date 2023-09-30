import { notFound } from 'next/navigation';
import validator from 'validator';
import { Config } from '@utils/config';
import { prisma } from '@utils/prisma';

export async function getPost(id: string, username: string) {
  if (!validator.isUUID(id)) return notFound();

  const post = await prisma.post.findFirst({
    include: { photo: true, user: true },
    where: { id, user: { username } },
  });

  if (!post) return notFound();

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

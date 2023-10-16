'use server';

import { Post } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { getUser } from '@app/getUser';
import { prisma } from '@utils/prisma';

export async function updatePost(id: string, data: Pick<Post, 'created' | 'location' | 'title'>) {
  const user = await getUser();

  await prisma.post.update({
    data: {
      created: new Date(data.created) || null,
      location: data.location || null,
      title: data.title || null,
    },
    where: {
      id,
      ownerId: user.id,
    },
  });

  revalidatePath(`/${encodeURIComponent(id)}`);
  revalidatePath('/');
}

export async function deletePost(id: string) {
  const user = await getUser();

  await prisma.post.delete({
    where: {
      id,
      ownerId: user.id,
    },
  });

  revalidatePath(`/${encodeURIComponent(id)}`);
  revalidatePath('/');
}

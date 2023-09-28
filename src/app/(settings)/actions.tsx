'use server';

import { Site } from '@prisma/client';
import { getUser } from '@app/getUser';
import { prisma } from '@utils/prisma';

export async function updateSettings(data: Partial<Site>) {
  const user = await getUser();

  await prisma.site.update({
    data: {
      description: data.description || null,
      facebook: data.facebook || null,
      github: data.github || null,
      imdb: data.imdb || null,
      instagram: data.instagram || null,
      linkedIn: data.linkedIn || null,
      name: data.name || null,
      title: data.title || null,
      twitter: data.twitter || null,
      watermarkPosition: data.watermarkPosition || null,
    },
    where: {
      ownerId: user.id,
    },
  });
}

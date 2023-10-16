'use server';

import { Site } from '@prisma/client';
import { revalidatePath, revalidateTag } from 'next/cache';
import validator from 'validator';
import { getUser } from '@app/getUser';
import { ValidationError } from '@utils/errors';
import { prisma } from '@utils/prisma';

export async function updateSettings(data: Partial<Site>) {
  const user = await getUser();

  if (data.resumeUrl && !validator.isURL(data.resumeUrl)) {
    throw new ValidationError('Resume URL is not valid');
  }

  await prisma.site.update({
    data: {
      description: data.description || null,
      facebook: data.facebook || null,
      github: data.github || null,
      imdb: data.imdb || null,
      instagram: data.instagram || null,
      linkedIn: data.linkedIn || null,
      name: data.name || null,
      resumeUrl: data.resumeUrl || null,
      title: data.title || null,
      twitter: data.twitter || null,
      watermarkPosition: data.watermarkPosition || null,
    },
    where: {
      ownerId: user.id,
    },
  });
}

export async function revalidateResume() {
  revalidatePath('/resume');
  revalidatePath('/resume.json');
  revalidateTag('resume');
}

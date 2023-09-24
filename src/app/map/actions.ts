'use server';

import { getUser } from '@app/getUser';
import { NoSiteError } from '@utils/errors';
import { prisma } from '@utils/prisma';
import {} from 'next/headers';

export async function checkIn(lng: number, lat: number, city: string, country: string, date: Date) {
  const user = await getUser();

  if (!user.sites) {
    throw new NoSiteError();
  }

  await prisma.gpsMarker.create({
    data: {
      city,
      country,
      date,
      latitude: parseFloat(lat.toFixed(15)),
      longitude: parseFloat(lng.toFixed(15)),
      sites: {
        connect: {
          id: user.sites.id,
        },
      },
    },
  });
}

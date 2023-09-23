import { prisma } from '@utils/prisma';

export async function getGpsMarkers(username: string) {
  const markers = await prisma.gpsMarker.findMany({
    where: { sites: { users: { username } } },
  });

  return markers;
}

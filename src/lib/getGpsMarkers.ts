import { Config } from '@utils/config';
import { prisma } from '@utils/prisma';

export async function getGpsMarkers() {
  const markers = await prisma.gpsMarker.findMany({
    orderBy: {
      date: 'asc',
    },
    where: { sites: { users: { username: Config.DEFAULT_USER } } },
  });

  return markers;
}

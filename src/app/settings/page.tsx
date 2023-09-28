import { notFound } from 'next/navigation';
import { SettingsForm } from './SettingsForm';
import { getUser } from '@app/getUser';
import { getSite } from '@lib/getSite';
import { prisma } from '@utils/prisma';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const [user, site] = await Promise.all([getUser().catch(() => {}), getSite()]);

  if (!site || site?.ownerId !== user?.id) {
    notFound();
  }

  const stats = await prisma.photo.aggregate({
    _count: true,
    _sum: { size: true },
    where: {
      ownerId: user.id,
    },
  });

  // eslint-disable-next-line no-underscore-dangle
  return <SettingsForm count={stats._count} site={site} size={stats._sum.size} />;
}

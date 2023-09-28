import { notFound } from 'next/navigation';
import { SettingsForm } from './SettingsForm';
import { getUser } from '@app/getUser';
import { getSite } from '@lib/getSite';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const [user, site] = await Promise.all([getUser().catch(() => {}), getSite()]);

  if (site?.ownerId !== user?.id) {
    notFound();
  }

  return <SettingsForm />;
}

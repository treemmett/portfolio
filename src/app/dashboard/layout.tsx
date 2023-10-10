import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ReactNode } from 'react';
import { Config } from '@utils/config';

export default async function DashboardLayout({ photo }: { photo: ReactNode }) {
  if (Config.NODE_ENV === 'production') notFound();

  return (
    <div className="p-4">
      {photo && (
        <div>
          <div className="flex justify-between">
            <h2>Latest Photo</h2>
            <Link href="/gallery">All Photos {'>'}</Link>
          </div>
          <div className="relative overflow-hidden rounded-lg">{photo}</div>
        </div>
      )}
    </div>
  );
}

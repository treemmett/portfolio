import Link from 'next/link';
import { ReactNode } from 'react';

export default async function DashboardLayout({ photo }: { photo: ReactNode }) {
  return (
    <div className="p-4">
      {photo && (
        <div>
          <div className="flex justify-between">
            <h2>Latest Photo</h2>
            <Link href="/gallery">All Photos {'>'}</Link>
          </div>
          <div className="rounded-lg overflow-hidden relative">{photo}</div>
        </div>
      )}
    </div>
  );
}

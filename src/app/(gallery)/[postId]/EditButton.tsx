'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FC } from 'react';
import { Edit } from 'react-feather';
import { AuthorizationScopes } from '@app/scopes';
import { useUser } from '@lib/user';

export const EditButton: FC = () => {
  const { hasPermission } = useUser();
  const path = usePathname();

  if (hasPermission(AuthorizationScopes.post)) {
    return (
      <Link className="button action" href={`${path}/edit`}>
        <Edit className="p-1" strokeWidth={1} />
      </Link>
    );
  }

  return null;
};

'use client';

import dynamic from 'next/dynamic';
import { FC } from 'react';
import { AuthorizationScopes } from '@entities/Jwt';
import { useUser } from '@lib/user';

const Dynamic = dynamic(() => import('./ApiManager').then((m) => m.ApiManager));

export const DynamicApiManager: FC = () => {
  const { hasPermission } = useUser();

  if (hasPermission(AuthorizationScopes.post)) {
    return <Dynamic />;
  }

  return null;
};

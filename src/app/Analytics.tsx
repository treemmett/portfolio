'use client';

import { usePathname } from 'next/navigation';
import { FC, useEffect } from 'react';
import { trace } from '@utils/analytics';

export const Analytics: FC = () => {
  const path = usePathname();

  useEffect(() => {
    if (path) {
      trace('page-view', {
        path,
      });
    }
  }, [path]);

  return null;
};

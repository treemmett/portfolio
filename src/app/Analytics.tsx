'use client';

import { useRouter } from 'next/router';
import { FC, useEffect } from 'react';
import { trace } from '@utils/analytics';

export const Analytics: FC = () => {
  const { asPath, locale } = useRouter();

  useEffect(() => {
    trace('page-view', {
      locale,
      path: asPath,
    });
  }, [asPath, locale]);

  return null;
};

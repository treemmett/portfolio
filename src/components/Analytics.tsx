import { trace } from 'console';
import { useRouter } from 'next/router';
import { FC, useEffect } from 'react';

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

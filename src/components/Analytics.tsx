import { init, track } from 'insights-js';
import { useRouter } from 'next/router';
import { FC, useEffect } from 'react';
import { Config } from '../utils/config';

export const Analytics: FC = () => {
  useEffect(() => {
    init(Config.NEXT_PUBLIC_INSIGHTS_TOKEN);
  }, []);

  const router = useRouter();

  useEffect(() => {
    track({
      id: 'page-view',
      parameters: {
        path: router.asPath,
      },
    });
  }, [router.asPath]);

  return null;
};

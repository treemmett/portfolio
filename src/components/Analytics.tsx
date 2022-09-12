import { init, parameters, track } from 'insights-js';
import { useRouter } from 'next/router';
import { FC, useEffect } from 'react';
import { apiClient } from '@utils/apiClient';
import { Config } from '@utils/config';

export const Analytics: FC = () => {
  useEffect(() => {
    init(Config.NEXT_PUBLIC_INSIGHTS_TOKEN);
    apiClient.post('/blimp');
  }, []);

  const { asPath, locale } = useRouter();

  useEffect(() => {
    track({
      id: 'page-view',
      parameters: {
        detectedLocale: parameters.locale(),
        locale,
        path: asPath,
        referrer: parameters.referrer(),
        screenType: parameters.screenType(),
      },
    });
  }, [asPath, locale]);

  return null;
};

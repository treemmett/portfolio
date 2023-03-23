import 'reflect-metadata';
import { appWithTranslation } from 'next-i18next';
import { AppProps } from 'next/app';
import { FC } from 'react';
import { SWRConfig } from 'swr';
import { Analytics } from '@components/Analytics';
import { ApiManager } from '@components/ApiManager';
import { DataStoreProvider } from '@components/DataStore';
import './_app.scss';

const MyApp: FC<AppProps> = ({ Component, pageProps }: AppProps) => (
  <SWRConfig value={{ fallback: pageProps.fallback }}>
    <DataStoreProvider defaults={pageProps}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <Component {...pageProps} />
      <ApiManager />
      <Analytics />
    </DataStoreProvider>
  </SWRConfig>
);

export default appWithTranslation(MyApp);

export { reportWebVitals } from 'next-axiom';

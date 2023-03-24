import 'reflect-metadata';
import { Josefin_Sans as JosefinSans } from '@next/font/google';
import { appWithTranslation } from 'next-i18next';
import { AppProps } from 'next/app';
import { FC } from 'react';
import { SWRConfig } from 'swr';
import { Analytics } from '@components/Analytics';
import { DataStoreProvider } from '@components/DataStore';
import './_app.scss';

const josefin = JosefinSans({ subsets: ['latin'], weight: ['300', '400'] });

const MyApp: FC<AppProps> = ({ Component, pageProps }: AppProps) => (
  <main className={josefin.className}>
    <SWRConfig value={{ fallback: pageProps.fallback }}>
      <DataStoreProvider defaults={pageProps}>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <Component {...pageProps} />
        <Analytics />
      </DataStoreProvider>
    </SWRConfig>
  </main>
);

export default appWithTranslation(MyApp);

export { reportWebVitals } from 'next-axiom';

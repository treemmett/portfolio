import 'reflect-metadata';
import { appWithTranslation } from 'next-i18next';
import { AppProps } from 'next/app';
import { FC } from 'react';
import { About } from '../components/About';
import { DataStoreProvider } from '../components/DataStore';
import './_app.scss';

const MyApp: FC<AppProps> = ({ Component, pageProps }: AppProps) => (
  <DataStoreProvider defaults={pageProps}>
    {/* eslint-disable-next-line react/jsx-props-no-spreading */}
    <Component {...pageProps} />
    <About />
  </DataStoreProvider>
);

export default appWithTranslation(MyApp);

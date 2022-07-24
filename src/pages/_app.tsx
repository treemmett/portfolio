import 'reflect-metadata';
import { appWithTranslation } from 'next-i18next';
import { AppProps } from 'next/app';
import { FC } from 'react';
import { About } from '../components/About';
import { DataStoreProvider } from '../components/DataStore';
import './_app.scss';

const MyApp: FC<AppProps> = ({ Component, pageProps }) => (
  <DataStoreProvider defaultPosts={pageProps.posts}>
    <About />
    {/* eslint-disable-next-line react/jsx-props-no-spreading */}
    <Component {...pageProps} />
  </DataStoreProvider>
);

export default appWithTranslation(MyApp);

import { appWithTranslation } from 'next-i18next';
import { AppProps } from 'next/app';
import { FC } from 'react';
import { DataStoreProvider } from '../components/DataStore';
import './_app.scss';

const MyApp: FC<AppProps> = ({ Component, pageProps }) => (
  <DataStoreProvider>
    {/* eslint-disable-next-line react/jsx-props-no-spreading */}
    <Component {...pageProps} />
  </DataStoreProvider>
);

export default appWithTranslation(MyApp);

import 'reflect-metadata';
import { appWithTranslation } from 'next-i18next';
import { AppProps } from 'next/app';
import { FC } from 'react';
import { DataStoreProvider } from '../components/DataStore';
import styles from './_app.module.scss';
import './_app.scss';

const MyApp: FC<AppProps> = ({ Component, pageProps }: AppProps) => (
  <DataStoreProvider defaults={pageProps}>
    <div className={styles.container}>
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
      <Component {...pageProps} />
    </div>
  </DataStoreProvider>
);

export default appWithTranslation(MyApp);

import { AppProps } from 'next/app';
import { FC } from 'react';
import '../styles/globals.scss';

// eslint-disable-next-line react/jsx-props-no-spreading
const MyApp: FC<AppProps> = ({ Component, pageProps }) => <Component {...pageProps} />;

export default MyApp;

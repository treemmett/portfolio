import 'reflect-metadata';
import { Josefin_Sans as JosefinSans } from '@next/font/google';
import { AppProps } from 'next/app';
import dynamic from 'next/dynamic';
import { FC } from 'react';
import { SWRConfig } from 'swr';
import './_app.scss';
import { Analytics } from '@components/Analytics';
import { AuthorizationScopes } from '@entities/Jwt';
import { useUser } from '@lib/user';

const josefin = JosefinSans({ subsets: ['latin'], weight: ['300', '400'] });

const DynamicSettings = dynamic(() => import('@components/Settings').then((mod) => mod.Settings));

const DynamicWelcome = dynamic(() => import('@components/Welcome').then((mod) => mod.Welcome));

const MyApp: FC<AppProps> = ({ Component, pageProps }: AppProps) => {
  const { hasPermission } = useUser();

  return (
    <SWRConfig value={{ fallback: pageProps.fallback || {}, revalidateOnFocus: false }}>
      <main className={josefin.className}>
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <Component {...pageProps} />

        <Analytics />

        {hasPermission(AuthorizationScopes.post) && <DynamicSettings />}

        {hasPermission(AuthorizationScopes.onboard) && <DynamicWelcome />}
      </main>
    </SWRConfig>
  );
};

export default MyApp;

export { reportWebVitals } from 'next-axiom';

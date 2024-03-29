import 'reflect-metadata';
import './global.scss';
import cx from 'classnames';
import { Josefin_Sans as JosefinSans } from 'next/font/google';
import { FC, PropsWithChildren } from 'react';
import { Analytics } from './(analytics)/react';
import { ModalManager } from '@components/ModalManager';

const josefin = JosefinSans({ subsets: ['latin'], weight: ['300', '400', '700'] });

const RootLayout: FC<PropsWithChildren> = ({ children }) => (
  <html lang="en">
    <body
      className={cx(
        'bg-white font-light text-black dark:bg-black dark:text-white',
        josefin.className,
      )}
    >
      {children}
      <Analytics />
      <ModalManager />
    </body>
  </html>
);
export default RootLayout;

export const metadata = {
  metadataBase: new URL('https://tregan.me'),
  openGraph: {
    images: '/og-image.png',
  },
};

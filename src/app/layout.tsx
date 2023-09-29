import 'reflect-metadata';
import './global.scss';
import { Analytics } from '@vercel/analytics/react';
import cx from 'classnames';
import { Josefin_Sans as JosefinSans } from 'next/font/google';
import { FC, PropsWithChildren } from 'react';

const josefin = JosefinSans({ subsets: ['latin'], weight: ['300', '400', '700'] });

const RootLayout: FC<PropsWithChildren> = ({ children }) => (
  <html lang="en">
    <body
      className={cx(
        'bg-white text-black dark:bg-black dark:text-white font-light',
        josefin.className,
      )}
    >
      {children}
      <Analytics />
    </body>
  </html>
);
export default RootLayout;

import 'reflect-metadata';
import './global.scss';
import { Josefin_Sans as JosefinSans } from 'next/font/google';
import { FC, PropsWithChildren } from 'react';

const josefin = JosefinSans({ subsets: ['latin'], weight: ['300', '400', '700'] });

const RootLayout: FC<PropsWithChildren> = ({ children }) => (
  <html lang="en">
    <body className="bg-white text-black dark:bg-black dark:text-white font-light">
      <main className={josefin.className}>{children}</main>
    </body>
  </html>
);
export default RootLayout;

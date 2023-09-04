import 'reflect-metadata';
import { Josefin_Sans as JosefinSans } from '@next/font/google';
import { FC, PropsWithChildren } from 'react';

const josefin = JosefinSans({ subsets: ['latin'], weight: ['300', '400'] });

const RootLayout: FC<PropsWithChildren> = ({ children }) => (
  <html lang="en">
    <body>
      <main className={josefin.className}>{children}</main>
    </body>
  </html>
);
export default RootLayout;

import { PropsWithChildren } from 'react';
import { Nav } from './navbar/Nav';

export default function MainLayout({ children }: PropsWithChildren) {
  return (
    <>
      <Nav />
      {children}
    </>
  );
}

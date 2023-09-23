import { PropsWithChildren } from 'react';
import { Nav } from '@components/Nav';
import { Mosaic } from 'src/app/(gallery)/Mosaic';

export default async function GalleryPage({ children }: PropsWithChildren) {
  return (
    <>
      <Nav />
      {children}
      <Mosaic />
    </>
  );
}

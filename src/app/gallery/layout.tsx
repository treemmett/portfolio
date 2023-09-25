import { PropsWithChildren } from 'react';
import { Mosaic } from '@app/gallery/Mosaic';
import { Nav } from '@components/Nav';

export default async function GalleryPage({ children }: PropsWithChildren) {
  return (
    <>
      <Nav />
      {children}
      <Mosaic />
    </>
  );
}

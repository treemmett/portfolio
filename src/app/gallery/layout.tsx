import { PropsWithChildren } from 'react';
import { Mosaic } from 'src/app/gallery/Mosaic';

export default async function GalleryPage({ children }: PropsWithChildren) {
  return (
    <>
      {children}
      <Mosaic />
    </>
  );
}

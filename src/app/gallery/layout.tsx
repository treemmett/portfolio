import { PropsWithChildren, ReactNode } from 'react';
import { Nav } from '@components/Nav';

export default async function GalleryPage({
  children,
  mosaic,
}: PropsWithChildren<{ mosaic: ReactNode }>) {
  return (
    <>
      <Nav />
      {children}
      {mosaic}
    </>
  );
}

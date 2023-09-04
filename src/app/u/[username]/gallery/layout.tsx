import { PropsWithChildren } from 'react';
import { Nav } from '@components/Nav';
import { Mosaic } from 'src/app/u/[username]/gallery/Mosaic';

export default async function GalleryPage({
  children,
  params,
}: PropsWithChildren<{ params: { username: string } }>) {
  return (
    <>
      <Nav username={params.username} />
      {children}
      <Mosaic username={params.username} />
    </>
  );
}

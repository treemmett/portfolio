import Link from 'next/link';
import { FC, PropsWithChildren } from 'react';
import { X } from 'react-feather';
import { ScrollLock } from '@components/ScrollLock';

const PostsLayout: FC<PropsWithChildren> = ({ children }) => (
  <div className="fixed left-0 top-0 w-screen h-screen p-4 bg-neutral-900/90 flex justify-center items-center">
    <ScrollLock />
    <div className="fixed left-0 top-0 py-6 px-8 left-0 flex w-full">
      <Link className="button ml-auto" href="/">
        <X />
      </Link>
    </div>
    {children}
  </div>
);

export default PostsLayout;

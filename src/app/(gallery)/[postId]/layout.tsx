import { FC, PropsWithChildren } from 'react';
import { ScrollLock } from '@components/ScrollLock';

const PostsLayout: FC<PropsWithChildren> = ({ children }) => (
  <div className="fixed left-0 top-0 z-20 flex h-screen w-screen items-center justify-center bg-neutral-900/90 p-4 backdrop-blur-sm">
    <ScrollLock />
    {children}
  </div>
);

export default PostsLayout;

import { FC, PropsWithChildren } from 'react';
import { ScrollLock } from '@components/ScrollLock';

const PostsLayout: FC<PropsWithChildren> = ({ children }) => (
  <div className="fixed z-20 left-0 top-0 w-screen h-screen p-4 bg-neutral-900/90 backdrop-blur-sm flex justify-center items-center">
    <ScrollLock />
    {children}
  </div>
);

export default PostsLayout;

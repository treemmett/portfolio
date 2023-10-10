import { FC } from 'react';
import { Spinner } from '@components/Spinner';

export const PostLoading: FC = () => (
  <div className="flex h-full items-center justify-center">
    <Spinner />
  </div>
);

export default PostLoading;

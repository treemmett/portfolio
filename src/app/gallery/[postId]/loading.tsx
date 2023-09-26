import { FC } from 'react';
import { Spinner } from '@components/Spinner';

export const PostLoading: FC = () => (
  <div className="h-full flex justify-center items-center">
    <Spinner />
  </div>
);

export default PostLoading;

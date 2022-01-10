import { FC } from 'react';
import { Post } from './Post';

export const Gallery: FC = () => (
  <section>
    {new Array(10).fill(null).map((_, i) => (
      // eslint-disable-next-line react/no-array-index-key
      <Post key={i} />
    ))}
  </section>
);

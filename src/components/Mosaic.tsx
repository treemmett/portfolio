import { FC } from 'react';
import styles from './Mosaic.module.scss';
import { Tile } from './Tile';
import { usePosts } from '@lib/posts';

export const Mosaic: FC = () => {
  const { posts } = usePosts();

  return (
    <div className={styles.mosaic}>
      {posts?.map((post) => (
        <Tile key={post.id} post={post} />
      ))}
    </div>
  );
};

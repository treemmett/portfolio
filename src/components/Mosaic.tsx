import { FC } from 'react';
import { useDataStore } from './DataStore';
import styles from './Mosaic.module.scss';
import { Tile } from './Tile';

export const Mosaic: FC = () => {
  const { posts } = useDataStore();

  return (
    <div className={styles.mosaic}>
      {posts.map((post) => (
        <Tile key={post.id} post={post} />
      ))}
    </div>
  );
};

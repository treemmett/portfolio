import { FC } from 'react';
import { useDataStore } from './DataStore';
import styles from './Gallery.module.scss';
import { Post } from './Post';

export const Gallery: FC = () => {
  const { posts } = useDataStore();

  return (
    <div className={styles.container}>
      {posts.map((post, i) => (
        <Post key={post.id} post={post} priority={i <= 1} />
      ))}
    </div>
  );
};

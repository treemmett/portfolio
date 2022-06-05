import { FC, useEffect } from 'react';
import { useDataStore } from './DataStore';
import styles from './Gallery.module.scss';
import { Post } from './Post';

export const Gallery: FC = () => {
  const { posts, loadPosts } = useDataStore();

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  return (
    <div className={styles.container}>
      {posts.map((post) => (
        <Post key={post.id} post={post} />
      ))}
    </div>
  );
};

import dynamic from 'next/dynamic';
import { FC, Suspense } from 'react';
import { useDataStore } from './DataStore';
import styles from './Gallery.module.scss';
import { Post } from './Post';
import { AuthorizationScopes } from '@entities/Jwt';

const DynamicEditor = dynamic(() => import('./Editor').then((mod) => mod.Editor));

export const Gallery: FC = () => {
  const { posts, session } = useDataStore();

  return (
    <div className={styles.gallery}>
      {posts.map((post, i) => (
        <Post key={post.id} post={post} priority={i <= 1} />
      ))}

      {session.hasPermission(AuthorizationScopes.post) && (
        <Suspense fallback="Loading...">
          <DynamicEditor />
        </Suspense>
      )}
    </div>
  );
};

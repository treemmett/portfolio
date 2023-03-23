import dynamic from 'next/dynamic';
import { FC, Suspense } from 'react';
import { useDataStore } from './DataStore';
import styles from './Mosaic.module.scss';
import { Tile } from './Tile';
import { AuthorizationScopes } from '@entities/Jwt';

const DynamicEditor = dynamic(() => import('./Editor').then((mod) => mod.Editor));

export const Mosaic: FC = () => {
  const { posts, session } = useDataStore();

  return (
    <>
      <div className={styles.mosaic}>
        {posts.map((post) => (
          <Tile key={post.id} post={post} />
        ))}
      </div>

      {session.hasPermission(AuthorizationScopes.post) && (
        <Suspense fallback="Loading...">
          <DynamicEditor />
        </Suspense>
      )}
    </>
  );
};

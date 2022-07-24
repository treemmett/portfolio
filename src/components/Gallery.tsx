import dynamic from 'next/dynamic';
import { FC, Suspense } from 'react';
import { AuthorizationScopes } from '../entities/Jwt';
import { useDataStore } from './DataStore';
import { Post } from './Post';

const DynamicEditor = dynamic(() => import('./Editor').then((mod) => mod.Editor));

export const Gallery: FC = () => {
  const { posts, session } = useDataStore();

  return (
    <>
      {posts.map((post, i) => (
        <Post key={post.id} post={post} priority={i <= 1} />
      ))}

      {session.hasPermission(AuthorizationScopes.post) && (
        <Suspense fallback="Loading...">
          <DynamicEditor />
        </Suspense>
      )}
    </>
  );
};

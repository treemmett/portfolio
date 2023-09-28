'use client';

import { Post } from '@prisma/client';
import dynamic from 'next/dynamic';
import { FC } from 'react';
import { AuthorizationScopes } from '@app/scopes';
import { useUser } from '@lib/user';

const Dynamic = dynamic(() => import('./Editor').then((m) => m.Editor));

export const DynamicEditor: FC<{ post: Post }> = ({ post }) => {
  const { hasPermission, user } = useUser();

  if (post.ownerId === user?.id && hasPermission(AuthorizationScopes.post)) {
    return <Dynamic post={post} />;
  }

  return null;
};

import { useCallback, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import useSWRMutate from 'swr/mutation';
import type { Post } from '@entities/Post';
import { apiClient } from '@utils/apiClient';

export function usePosts() {
  const { data, isLoading, error } = useSWR('posts', async () => {
    const response = await apiClient.get<Post[]>('/post');
    return response.data;
  });

  const { trigger } = useSWRMutate<Post, Error, 'posts', Post>(
    'posts',
    async (key, { arg }) => arg,
    {
      populateCache(result: Post, currentData: Post[]) {
        if (!currentData) return [result];

        return [result, ...currentData];
      },
      revalidate: false,
    }
  );

  const addPost = useCallback((post: Post) => trigger(post), [trigger]);

  return {
    addPost,
    error,
    isLoading,
    posts: data,
  };
}

export function usePost(id: string) {
  const { posts } = usePosts();
  const foundPost = useMemo(() => posts?.find((p) => p.id === id), [id, posts]);
  const [post, setPost] = useState<Post | undefined>(foundPost);
  useEffect(() => {
    setPost(foundPost);
  }, [foundPost]);

  const {
    isMutating,
    trigger,
    error: mutationError,
  } = useSWRMutate(
    'posts',
    async () => {
      const response = await apiClient.patch<Post>(`/post/${encodeURI(id)}`, post);
      return response.data;
    },
    {
      populateCache(result: Post, currentData: Post[]) {
        if (!currentData) return [];

        const filteredData = currentData.filter((p) => p.id !== result.id);
        return [...filteredData, result];
      },
      revalidate: false,
    }
  );

  return {
    isSaving: isMutating,
    mutationError,
    post,
    save: trigger,
    setPost,
  };
}

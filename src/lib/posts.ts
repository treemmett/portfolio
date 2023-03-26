import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import useSWRMutate from 'swr/mutation';
import type { IPost } from '@entities/Post';
import { apiClient } from '@utils/apiClient';

export function usePosts() {
  const { query } = useRouter();
  const { data, isLoading, error } = useSWR(`posts`, async () => {
    const response = await apiClient.get<IPost[]>('/post', {
      params: { username: query.username },
    });
    return response.data;
  });

  const { trigger } = useSWRMutate<IPost, Error, string, IPost>(
    `posts`,
    async (key, { arg }) => arg,
    {
      populateCache(result: IPost, currentData: IPost[]) {
        if (!currentData) return [result];

        return [result, ...currentData];
      },
      revalidate: false,
    }
  );

  const addPost = useCallback((post: IPost) => trigger(post), [trigger]);

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
  const [post, setPost] = useState<IPost | undefined>(foundPost);
  useEffect(() => {
    setPost(foundPost);
  }, [foundPost]);

  const {
    isMutating,
    trigger,
    error: mutationError,
  } = useSWRMutate(
    `posts`,
    async () => {
      const response = await apiClient.patch<IPost>(`/post/${encodeURI(id)}`, post);
      return response.data;
    },
    {
      populateCache(result: IPost, currentData: IPost[]) {
        if (!currentData) return [];

        const filteredData = currentData.filter((p) => p.id !== result.id);
        return [...filteredData, result];
      },
      revalidate: false,
    }
  );

  const {
    isMutating: isDeleting,
    trigger: deleteTrigger,
    error: deleteError,
  } = useSWRMutate(
    `posts`,
    async () => {
      await apiClient.delete(`/post/${encodeURI(id)}`);
      return post;
    },
    {
      populateCache(result, currentData: IPost[]) {
        if (!currentData) return [];

        const filteredData = currentData.filter((p) => p.id !== result?.id);
        return [...filteredData];
      },
      revalidate: false,
    }
  );

  return {
    deleteError,
    deleteTrigger,
    isDeleting,
    isSaving: isMutating,
    mutationError,
    post,
    save: trigger,
    setPost,
  };
}

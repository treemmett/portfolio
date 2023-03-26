import { ParsedUrlQuery } from 'querystring';
import { useRouter } from 'next/router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import useSWRMutate from 'swr/mutation';
import type { IPost } from '@entities/Post';
import { apiClient } from '@utils/apiClient';
import { APIError } from '@utils/errors';

function getKey(query: ParsedUrlQuery) {
  return query.username ? `posts/${encodeURIComponent(query.username as string)}` : 'posts';
}

export function usePosts() {
  const { query } = useRouter();
  const { data, isLoading, error } = useSWR<IPost[], APIError>(getKey(query), async () => {
    const response = await apiClient.get<IPost[]>('/post', {
      params: { username: query.username },
    });
    return response.data;
  });

  const { trigger } = useSWRMutate<IPost, APIError, string, IPost>(
    getKey(query),
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
  const { query } = useRouter();
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
  } = useSWRMutate<IPost, APIError>(
    getKey(query),
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
    getKey(query),
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

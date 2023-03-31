import useSWR from 'swr';
import type { PhotoStats } from '@entities/Photo';
import { apiClient } from '@utils/apiClient';

export function usePhotoStats() {
  const { data, isLoading, error } = useSWR('photo-stats', async () => {
    const response = await apiClient.get<PhotoStats>('/photos/stats');
    return response.data;
  });

  return {
    count: data?.count || 0,
    error,
    isLoading,
    size: data?.size || 0,
  };
}

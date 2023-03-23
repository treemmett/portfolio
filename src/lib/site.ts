import useSWR from 'swr';
import type { ISite } from '@entities/Site';
import { apiClient } from '@utils/apiClient';

export function useSite() {
  const { data, isLoading, error } = useSWR('site', async () => {
    const response = await apiClient.get<ISite>('/site');
    return response.data;
  });

  return {
    error,
    isLoading,
    site: data,
  };
}

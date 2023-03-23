import { useEffect, useState } from 'react';
import useSWR from 'swr';
import useSWRMutate from 'swr/mutation';
import type { ISite } from '@entities/Site';
import { apiClient } from '@utils/apiClient';

export function useSite() {
  const { data, isLoading, error } = useSWR('site', async () => {
    const response = await apiClient.get<ISite>('/site');
    return response.data;
  });

  const [site, setSite] = useState<ISite | undefined>(data);

  useEffect(() => {
    setSite(data);
  }, [data]);

  const {
    isMutating,
    trigger,
    error: mutationError,
  } = useSWRMutate(
    'site',
    async () => {
      const response = await apiClient.patch<ISite>('/site', site);
      return response.data;
    },
    { populateCache: (s) => s, revalidate: false }
  );

  return {
    error,
    isLoading,
    isMutating,
    mutationError,
    save: trigger,
    setSite,
    site,
  };
}

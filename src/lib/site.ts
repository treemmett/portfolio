import { ParsedUrlQuery } from 'querystring';
import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import useSWRMutate from 'swr/mutation';
import type { UploadToken } from '@entities/Photo';
import type { ISite } from '@entities/Site';
import { apiClient } from '@utils/apiClient';
import { APIError } from '@utils/errors';

function getKey(query: ParsedUrlQuery) {
  return query.username ? `site/${encodeURIComponent(query.username as string)}` : 'site';
}

export function useSite() {
  const { query } = useRouter();

  const { data, isLoading, error } = useSWR<ISite, APIError>(getKey(query), async () => {
    const response = await apiClient.get<ISite>('/site', { params: { username: query.username } });
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
  } = useSWRMutate<ISite, APIError>(
    getKey(query),
    async () => {
      if (site?.logoFile) {
        const uploadTokenResponse = await apiClient.post<UploadToken>('/site/logo');
        await axios.put(uploadTokenResponse.data.url, site.logoFile, {
          headers: { 'Content-Type': 'application/octet-stream' },
        });
        await apiClient.put<ISite>('/site/logo', { token: uploadTokenResponse.data.token });
      }

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

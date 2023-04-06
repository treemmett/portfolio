import { useCallback } from 'react';
import useSWR from 'swr';
import useSWRMutate from 'swr/mutation';
import { useSite } from './site';
import { IMarker } from '@entities/GPSMarker';
import { ISite } from '@entities/Site';
import { apiClient } from '@utils/apiClient';
import { APIError } from '@utils/errors';

function getKey(site?: ISite) {
  return site?.owner?.username ? `markers/${encodeURIComponent(site.owner.username)}` : 'markers';
}

export function useMarkers() {
  const { site } = useSite();
  const { data, isLoading, error } = useSWR<IMarker[], APIError>(getKey(site), async () => {
    const response = await apiClient.get<IMarker[]>('/marker', {
      params: { username: site?.owner.username },
    });
    return response.data;
  });

  const { trigger } = useSWRMutate<
    IMarker,
    APIError,
    string,
    Pick<IMarker, 'city' | 'country' | 'date'> & { lng: number; lat: number }
  >(
    getKey(site),
    async (key, { arg }) => {
      const response = await apiClient.post<IMarker>('/marker', arg);
      return response.data;
    },
    {
      populateCache(result: IMarker, currentData: IMarker[]) {
        if (!currentData) return [result];

        return [result, ...currentData];
      },
      revalidate: false,
    }
  );

  const addMarker = useCallback(
    (marker: Pick<IMarker, 'city' | 'country' | 'date'> & { lng: number; lat: number }) =>
      trigger(marker),
    [trigger]
  );

  return {
    addMarker,
    error,
    isLoading,
    markers: data,
  };
}

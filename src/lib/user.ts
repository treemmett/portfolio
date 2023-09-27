import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { logout as logoutAction } from '../app/login/actions';
import { AuthorizationScopes } from '@entities/Jwt';
import type { IUser } from '@entities/User';
import { trace } from '@utils/analytics';
import { apiClient } from '@utils/apiClient';
import { APIError, UnauthenticatedError } from '@utils/errors';

async function getUser(): Promise<IUser | null> {
  if (!document.cookie) return null;

  const cookies = Object.fromEntries(
    document.cookie.split(';').map((cookie) => {
      const [name, value] = cookie.split('=');
      return [name.trim(), value.trim()];
    }),
  );

  const { accessToken } = cookies;
  if (!accessToken) return null;

  const { data } = await apiClient.get<IUser>('/user');
  return data;
}

export function useUser() {
  const [user, setUser] = useState<IUser>();
  const { data, error } = useSWR<IUser | null, APIError>('user', getUser, { refreshInterval: 0 });
  useEffect(() => setUser(data || undefined), [data]);

  const hasPermission = useCallback(
    (...perms: AuthorizationScopes[]): boolean => {
      if (!data) return false;
      return perms.every((p) => data.scopes.includes(p));
    },
    [data],
  );

  const { trigger: login, isMutating: isLoggingIn } = useSWRMutation<IUser | null, APIError>(
    'user',
    async () => {
      trace('begin-login');

      const popup = window.open(
        '/login',
        'oauth',
        `popup,width=500,height=750,left=${global.screen.width / 2 - 250}`,
      );

      if (!popup) return null;

      await new Promise<void>((res) => {
        const i = setInterval(() => {
          if (popup.closed) {
            clearInterval(i);
            res();
          }
        }, 100);
      });

      return getUser();
    },
  );

  const { trigger: logout } = useSWRMutation<IUser | null, APIError>(
    'user',
    async () => {
      logoutAction();
      return null;
    },
    {
      populateCache: () => null,
      revalidate: false,
    },
  );

  const { trigger: save, isMutating: isSaving } = useSWRMutation<IUser | null, APIError>(
    'user',
    async () => {
      if (!user) throw new UnauthenticatedError();

      const response = await apiClient.patch<{ user: IUser; accessToken: string }>('/user', {
        username: user?.username,
      });

      return response.data.user;
    },
    { populateCache: (result) => result, revalidate: false },
  );

  return {
    error,
    hasPermission,
    isLoggingIn,
    isMutating: isLoggingIn || isSaving,
    isSaving,
    login,
    logout,
    save,
    setUser,
    user,
  };
}

export async function usernameAvailable(username: string): Promise<boolean> {
  const response = await apiClient.get('/user/available', { params: { username } });
  return response.data;
}

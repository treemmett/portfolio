import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { ACCESS_TOKEN_STORAGE_KEY, AuthorizationScopes } from '@entities/Jwt';
import type { IUser } from '@entities/User';
import { OAuthCloseMessage, OAuthErrorMessage, OAuthSuccessMessage } from '@pages/login';
import { trace } from '@utils/analytics';
import { apiClient } from '@utils/apiClient';
import {
  APIError,
  BadCrossOriginError,
  OAuthHandshakeError,
  UnauthenticatedError,
} from '@utils/errors';

async function getUser(): Promise<IUser | null> {
  const token = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);

  if (!token) return null;

  const { data } = await apiClient.get<IUser>('/user', {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  return data;
}

export function useUser() {
  const [user, setUser] = useState<IUser>();
  const { data, error } = useSWR<IUser | null, APIError>('user', getUser);
  useEffect(() => setUser(data || undefined), [data]);

  const hasPermission = useCallback(
    (...perms: AuthorizationScopes[]): boolean => {
      if (!data) return false;
      return perms.every((p) => data.scopes.includes(p));
    },
    [data]
  );

  const { trigger: login, isMutating: isLoggingIn } = useSWRMutation<IUser | null, APIError>(
    'user',
    async () => {
      trace('begin-login');

      const popup = window.open(
        '/api/login/oauth',
        'oauth',
        `popup,width=500,height=750,left=${global.screen.width / 2 - 250}`
      );

      return new Promise<IUser | null>((res) => {
        const intervalId = setInterval(() => {
          if (!popup || popup.closed) {
            trace('login-closed');
            clearInterval(intervalId);
            res(null);
          }
        }, 100);

        const messageHandler = async (
          event: MessageEvent<OAuthSuccessMessage | OAuthErrorMessage>
        ) => {
          if (event.origin !== window.location.origin) {
            trace('login-failed', {
              type: 'cross-origin',
            });
            throw new BadCrossOriginError();
          }

          clearInterval(intervalId);

          event.source?.postMessage({
            type: 'OAUTH_CLOSE',
          } as OAuthCloseMessage);

          window.removeEventListener('message', messageHandler);

          if (event.data.type === 'OAUTH_ERROR') {
            throw new OAuthHandshakeError();
          }

          if (event.data.type === 'OAUTH_CODE') {
            trace('login-granted');
            localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, event.data.payload);
            res(await getUser());
          }
        };

        window.addEventListener('message', messageHandler);
      });
    }
  );

  const { trigger: logout } = useSWRMutation<IUser | null, APIError>(
    'user',
    async () => {
      localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
      return null;
    },
    {
      populateCache: () => null,
      revalidate: false,
    }
  );

  const { trigger: save, isMutating: isSaving } = useSWRMutation<IUser | null, APIError>(
    'user',
    async () => {
      if (!user) throw new UnauthenticatedError();

      const response = await apiClient.patch<{ user: IUser; accessToken: string }>('/user', {
        username: user?.username,
      });

      localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, response.data.accessToken);

      return response.data.user;
    },
    { populateCache: (result) => result, revalidate: false }
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

import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { ACCESS_TOKEN_STORAGE_KEY, AuthorizationScopes } from '@entities/Jwt';
import type { IUser } from '@entities/User';
import { OAuthCloseMessage, OAuthErrorMessage, OAuthSuccessMessage } from '@pages/login';
import { trace } from '@utils/analytics';
import { apiClient } from '@utils/apiClient';
import { Config } from '@utils/config';

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

export function useSession() {
  const [user, setUser] = useState<IUser>();
  const { data } = useSWR<IUser | null>('user', getUser);
  useEffect(() => setUser(data || undefined), [data]);

  const hasPermission = useCallback(
    (...perms: AuthorizationScopes[]): boolean => {
      if (!data) return false;
      return perms.every((p) => data.scopes.includes(p));
    },
    [data]
  );

  const { trigger: login } = useSWRMutation('user', async () => {
    trace('begin-login');

    const popup = window.open(
      `https://github.com/login/oauth/authorize?client_id=${Config.NEXT_PUBLIC_GITHUB_CLIENT_ID}`,
      'oauth',
      `popup,width=500,height=750,left=${global.screen.width / 2 - 250}`
    );

    await new Promise<IUser | null>((res) => {
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
          throw new Error('Message failed cross-origin check');
        }

        clearInterval(intervalId);

        event.source?.postMessage({
          type: 'OAUTH_CLOSE',
        } as OAuthCloseMessage);

        window.removeEventListener('message', messageHandler);

        if (event.data.type === 'OAUTH_ERROR') {
          trace('login-failed', {
            error: event.data.payload,
            type: 'provider-rejected',
          });
          throw new Error(event.data.payload);
        }

        if (event.data.type === 'OAUTH_CODE') {
          trace('login-granted');
          const loginResponse = await apiClient.post<string>('/login', {
            code: event.data.payload,
          });

          localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, loginResponse.data);
          res(await getUser());
        }
      };

      window.addEventListener('message', messageHandler);
    });
  });

  const { trigger: logout } = useSWRMutation(
    'user',
    async () => {
      localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    },
    {
      populateCache: () => null,
      revalidate: false,
    }
  );

  return {
    hasPermission,
    login,
    logout,
    setUser,
    user,
  };
}

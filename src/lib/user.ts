import { useCallback, useEffect, useState } from 'react';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { getCurrentUser, logout as logoutAction } from '../app/login/actions';
import { AuthorizationScopes } from '@entities/Jwt';
import { trace } from '@utils/analytics';
import { APIError } from '@utils/errors';

interface User {
  id: string;
  scopes: AuthorizationScopes[];
  username: string;
}

async function getUser(): Promise<User | null> {
  if (!document.cookie) return null;

  const cookies = Object.fromEntries(
    document.cookie.split(';').map((cookie) => {
      const [name, value] = cookie.split('=');
      return [name.trim(), value.trim()];
    }),
  );

  const { accessToken } = cookies;
  if (!accessToken) return null;

  const [, payload] = accessToken.split('.');
  let body: { sub: string; scp: AuthorizationScopes[] };
  try {
    body = JSON.parse(atob(payload));
  } catch {
    return null;
  }

  const user = await getCurrentUser();

  return {
    ...user,
    scopes: body.scp,
  };
}

export function useUser() {
  const [user, setUser] = useState<User>();
  const { data, error } = useSWR<User | null, APIError>('user', getUser, { refreshInterval: 0 });
  useEffect(() => setUser(data || undefined), [data]);

  const hasPermission = useCallback(
    (...perms: AuthorizationScopes[]): boolean => {
      if (!data) return false;
      return perms.every((p) => data.scopes.includes(p));
    },
    [data],
  );

  const { trigger: login, isMutating: isLoggingIn } = useSWRMutation<User | null, APIError>(
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

  const { trigger: logout } = useSWRMutation<null, APIError>(
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

  return {
    error,
    hasPermission,
    isLoggingIn,
    login,
    logout,
    setUser,
    user,
  };
}

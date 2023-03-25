import { decodeJwt } from 'jose';
import { useCallback, useEffect, useState } from 'react';
import { ACCESS_TOKEN_STORAGE_KEY, AuthorizationScopes, Jwt } from '@entities/Jwt';
import { OAuthCloseMessage, OAuthErrorMessage, OAuthSuccessMessage } from '@pages/login';
import { trace } from '@utils/analytics';
import { apiClient } from '@utils/apiClient';
import { Config } from '@utils/config';

export function useSession() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string>();
  const [scopes, setScopes] = useState<AuthorizationScopes[]>([]);
  const [accessToken, setAccessToken] = useState<string>();

  const logout = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    setUserId(undefined);
    setScopes([]);
    setIsLoggedIn(false);
    setAccessToken(undefined);
  }, []);

  const parseToken = useCallback((token: string | null) => {
    if (!token) return;

    const { exp, scp, sub } = decodeJwt(token) as unknown as Jwt;

    if (new Date() >= new Date(exp * 1000)) return;

    setUserId(sub);
    setScopes(scp);
    setIsLoggedIn(true);
    setAccessToken(token);
    localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, token);
  }, []);

  useEffect(() => {
    parseToken(localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY));
  }, [parseToken]);

  useEffect(() => {
    let id: number;

    if (isLoggedIn) {
      id = apiClient.interceptors.request.use((req) => {
        if (!req.headers) req.headers = {};

        if (accessToken) {
          req.headers.authorization = `Bearer ${accessToken}`;
        }

        return req;
      });
    }

    return () => apiClient.interceptors.request.eject(id);
  }, [accessToken, isLoggedIn]);

  const hasPermission = useCallback(
    (...perms: AuthorizationScopes[]): boolean => perms.every((p) => scopes.includes(p)),
    [scopes]
  );

  const login = useCallback(() => {
    trace('begin-login');

    const popup = window.open(
      `https://github.com/login/oauth/authorize?client_id=${Config.NEXT_PUBLIC_GITHUB_CLIENT_ID}`,
      'oauth',
      `popup,width=500,height=750,left=${global.screen.width / 2 - 250}`
    );

    const intervalId = setInterval(() => {
      if (!popup || popup.closed) {
        trace('login-closed');
        logout();
        clearInterval(intervalId);
      }
    }, 100);

    const messageHandler = async (event: MessageEvent<OAuthSuccessMessage | OAuthErrorMessage>) => {
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
        logout();
        trace('login-failed', {
          error: event.data.payload,
          type: 'provider-rejected',
        });
        throw new Error(event.data.payload);
      }

      if (event.data.type === 'OAUTH_CODE') {
        trace('login-granted');
        const loginResponse = await apiClient.post('/login', { code: event.data.payload });
        parseToken(loginResponse.data);
      }
    };

    window.addEventListener('message', messageHandler);
  }, [logout, parseToken]);

  return {
    hasPermission,
    isLoggedIn,
    login,
    logout,
    userId,
  };
}

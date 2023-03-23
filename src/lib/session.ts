import { useCallback, useEffect, useState } from 'react';
import { ACCESS_TOKEN_STORAGE_KEY } from '@entities/Jwt';
import { Session } from '@entities/Session';
import { OAuthCloseMessage, OAuthErrorMessage, OAuthSuccessMessage } from '@pages/login';
import { trace } from '@utils/analytics';
import { apiClient } from '@utils/apiClient';
import { Config } from '@utils/config';

export function useSession() {
  const [session, setSession] = useState(new Session());
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setSession(Session.restore());
  }, []);

  useEffect(() => {
    setIsLoggedIn(session.isValid());

    const id = apiClient.interceptors.request.use((req) => {
      if (!req.headers) req.headers = {};

      if (session.isValid()) {
        req.headers.authorization = `Bearer ${session.accessToken}`;
      }

      return req;
    });

    return () => apiClient.interceptors.request.eject(id);
  }, [session]);

  const login = useCallback(() => {
    if (session?.expiration && session.expiration > new Date()) return;

    trace('begin-login');

    const popup = window.open(
      `https://github.com/login/oauth/authorize?client_id=${Config.NEXT_PUBLIC_GITHUB_CLIENT_ID}`,
      'oauth',
      `popup,width=500,height=750,left=${global.screen.width / 2 - 250}`
    );

    const intervalId = setInterval(() => {
      if (!popup || popup.closed) {
        trace('login-closed');
        setSession(new Session());
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
        setSession(new Session());
        trace('login-failed', {
          error: event.data.payload,
          type: 'provider-rejected',
        });
        throw new Error(event.data.payload);
      }

      if (event.data.type === 'OAUTH_CODE') {
        trace('login-granted');
        const loginResponse = await apiClient.post('/login', { code: event.data.payload });
        const s = new Session(loginResponse.data);
        localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, loginResponse.data);
        trace('login-success', {
          expiration: s.expiration?.toISOString(),
          scope: s.scope?.join(','),
          username: s.username,
        });
        setSession(s);
      }
    };

    window.addEventListener('message', messageHandler);
  }, [session]);

  const logout = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    setIsLoggedIn(false);
  }, []);

  return {
    isLoggedIn,
    login,
    logout,
  };
}

import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useCallback, useEffect } from 'react';

export interface OAuthSuccessMessage {
  type: 'OAUTH_CODE';
  payload: string;
}

export interface OAuthErrorMessage {
  type: 'OAUTH_ERROR';
  payload: string;
}

export interface OAuthCloseMessage {
  type: 'OAUTH_CLOSE';
}

const Login: NextPage = () => {
  const { query } = useRouter();

  useEffect(() => {
    if (!window.opener) {
      window.close();
    }

    if (query.error) {
      window.opener.postMessage({
        payload: query.error,
        type: 'OAUTH_ERROR',
      } as OAuthErrorMessage);
    }

    if (query.code) {
      window.opener.postMessage({
        payload: query.code,
        type: 'OAUTH_CODE',
      } as OAuthSuccessMessage);
    }
  }, [query.code, query.error]);

  const successHandler = useCallback((e: MessageEvent<OAuthCloseMessage>) => {
    if (e.origin !== window.location.origin) {
      throw new Error('Message failed cross-origin check');
    }

    if (e.data.type === 'OAUTH_CLOSE') window.close();
  }, []);

  useEffect(() => {
    window.addEventListener('message', successHandler);

    return () => window.removeEventListener('message', successHandler);
  }, [successHandler]);

  return null;
};

export default Login;

import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export interface OAuthSuccessMessage {
  type: 'OAUTH_CODE';
  payload: string;
}

export interface OAuthErrorMessage {
  type: 'OAUTH_ERROR';
  payload: string;
}

const Login: NextPage = () => {
  const { query } = useRouter();

  useEffect(() => {
    if (!window.name) return;

    if (query.error) {
      window.postMessage({
        payload: query.error,
        type: 'OAUTH_ERROR',
      } as OAuthErrorMessage);
    }

    if (query.code) {
      window.postMessage({
        payload: query.code,
        type: 'OAUTH_CODE',
      } as OAuthSuccessMessage);
    }

    window.close();
  }, [query.code, query.error]);

  return null;
};

export default Login;

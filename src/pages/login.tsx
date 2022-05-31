import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { CSRF_STORAGE_KEY, isAuthenticated } from '../utils/authentication';
import { apiClient } from '../utils/clients';
import { Config } from '../utils/config';
import { ErrorCode } from '../utils/errors';

enum LOGIN_STATES {
  default,
  authorizing,
  denied,
  error,
  success,
}

const Login: NextPage = () => {
  const [state, setState] = useState(LOGIN_STATES.default);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get('error')) {
      setState(params.get('error') === 'access_denied' ? LOGIN_STATES.denied : LOGIN_STATES.error);
      return;
    }

    if (isAuthenticated()) {
      setState(LOGIN_STATES.success);
      return;
    }

    if (!params.get('code')) {
      window.location.replace(
        `https://github.com/login/oauth/authorize?client_id=${Config.NEXT_PUBLIC_GITHUB_CLIENT_ID}`
      );

      return;
    }

    setState(LOGIN_STATES.authorizing);

    apiClient
      .post('/api/login', { code: params.get('code') })
      .then((response) => {
        localStorage.setItem(CSRF_STORAGE_KEY, JSON.stringify(response.data));
        setState(LOGIN_STATES.success);
      })
      .catch((err) => {
        setState(LOGIN_STATES.error);
        if (err.response?.data?.error === ErrorCode.invalid_auth_code) {
          window.location.replace(
            `https://github.com/login/oauth/authorize?client_id=${Config.NEXT_PUBLIC_GITHUB_CLIENT_ID}`
          );
        } else {
          setState(LOGIN_STATES.error);
        }
      });
  }, []);

  switch (state) {
    case LOGIN_STATES.denied:
      return (
        <div>
          Authorization with GitHub was denied. Try again, or don't try again. I really don't care.
        </div>
      );

    case LOGIN_STATES.error:
      return <div>An error occurred while logging in.</div>;

    case LOGIN_STATES.default:
    default:
      return <div>Logging in...</div>;
  }
};

export default Login;

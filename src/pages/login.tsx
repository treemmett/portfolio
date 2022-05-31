import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { CSRF_STORAGE_KEY, isAuthenticated } from '../utils/authentication';
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

    fetch('/api/login', {
      body: JSON.stringify({ code: params.get('code') }),
      headers: { 'Content-Type': 'application/json' },
      method: 'post',
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          // invalid auth code, try again
          if (data.error === ErrorCode.invalid_auth_code) {
            window.location.replace(
              `https://github.com/login/oauth/authorize?client_id=${Config.NEXT_PUBLIC_GITHUB_CLIENT_ID}`
            );
          } else {
            setState(LOGIN_STATES.error);
          }
          return;
        }

        localStorage.setItem(CSRF_STORAGE_KEY, JSON.stringify(data));
        setState(LOGIN_STATES.success);
      });
  }, []);

  if (state === LOGIN_STATES.denied)
    return (
      <div>
        Authorization with GitHub was denied. Try again, or don't try again. I really don't care.
      </div>
    );

  return <div>Logging in...</div>;
};

export default Login;

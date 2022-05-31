import { NextPage } from 'next';
import { useEffect, useState } from 'react';
import { ErrorCode } from '../utils/errors';

const Login: NextPage = () => {
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get('error')) {
      const githubError = params.get('error');

      if (githubError === 'access_denied') {
        setDenied(true);
      }
    } else if (!params.get('code')) {
      window.location.replace(
        `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}`
      );
    } else {
      fetch('/api/login', {
        body: JSON.stringify({ code: params.get('code') }),
        headers: { 'Content-Type': 'application/json' },
        method: 'post',
      })
        .then((r) => r.json())
        .then((data) => {
          // invalid auth code, try again
          if (data.error === ErrorCode.invalid_auth_code) {
            window.location.replace(
              `https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID}`
            );
          }

          localStorage.setItem('csrf-token', data.token);
        });
    }
  }, []);

  if (denied)
    return (
      <div>
        Authorization with GitHub was denied. Try again, or don't try again. I really don't care.
      </div>
    );

  return <div>Logging in...</div>;
};

export default Login;

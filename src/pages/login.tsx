import { NextPage } from 'next';
import { useEffect } from 'react';

const Login: NextPage = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (!params.get('code')) {
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
        .then(console.log)
        .catch(console.log);
    }
  }, []);

  return <div>Logging in...</div>;
};

export default Login;

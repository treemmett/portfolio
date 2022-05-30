import axios from 'axios';

export class User {
  public static async authorize(code: string) {
    const authResponse = await axios.post(
      'https://github.com/login/oauth/access_token',
      {
        client_id: process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: 'application/json' }, validateStatus: () => true }
    );

    if (authResponse.status !== 200 || authResponse.data.error) {
      return { authResponse: authResponse.data, authStatus: authResponse.status };
    }

    const userResponse = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `token ${authResponse.data.access_token}` },
      validateStatus: () => true,
    });

    return {
      authResponse: authResponse.data,
      authStatus: authResponse.status,
      userResponse: userResponse.data,
      userStatus: userResponse.status,
    };
  }
}

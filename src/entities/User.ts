import axios from 'axios';
import { APIError, ErrorCode } from '../utils/errors';

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
      switch (authResponse.data?.error) {
        case 'incorrect_client_credentials':
          throw new APIError(ErrorCode.invalid_auth_secret);
        case 'bad_verification_code':
          throw new APIError(ErrorCode.invalid_auth_code);
        default:
          throw new APIError(ErrorCode.never);
      }
    }

    const userResponse = await axios.get('https://api.github.com/user', {
      headers: {
        Accept: 'application/json',
        Authorization: `token ${authResponse.data.access_token}`,
      },
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

import axios from 'axios';
import { IsString, IsUUID } from 'class-validator';
import { SignJWT } from 'jose';
import { BaseEntity, Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';
import { v4 } from 'uuid';
import { AuthorizationScopes } from './Jwt';
import { Config } from '@utils/config';
import { APIError, ErrorCode } from '@utils/errors';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @IsString()
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  public id: string;

  @Index({ unique: true })
  @Column({ nullable: true, type: 'int' })
  public githubId?: number | null;

  public static async authorizeGitHub(code: string) {
    const authResponse = await axios.post<
      | {
          access_token: string;
          token_type: string;
          scope: string;
        }
      | {
          error: string;
          error_description: string;
          error_uri: string;
        }
    >(
      'https://github.com/login/oauth/access_token',
      {
        client_id: Config.NEXT_PUBLIC_GITHUB_CLIENT_ID,
        client_secret: Config.GITHUB_CLIENT_SECRET,
        code,
      },
      { headers: { Accept: 'application/json' }, validateStatus: () => true }
    );

    if (authResponse.status !== 200 || 'error' in authResponse.data) {
      if (!('error' in authResponse.data)) {
        throw new APIError(ErrorCode.github_error);
      }

      switch (authResponse.data?.error) {
        case 'incorrect_client_credentials':
          throw new APIError(ErrorCode.invalid_auth_secret);
        case 'bad_verification_code':
          throw new APIError(ErrorCode.invalid_auth_code);
        default:
          throw new APIError(ErrorCode.github_error);
      }
    }

    const { status, data } = await axios.get<{
      login: string;
      id: number;
      avatar_url: string;
      name: string;
    }>('https://api.github.com/user', {
      headers: {
        Accept: 'application/json',
        Authorization: `token ${authResponse.data.access_token}`,
      },
      validateStatus: () => true,
    });

    if (status !== 200) {
      throw new APIError(ErrorCode.github_error);
    }

    let user = await User.findOneBy({ githubId: data.id });
    if (!user) {
      user = new User();
      user.id = v4();
      user.githubId = data.id;
      await user.save();
    }

    const scopes: AuthorizationScopes[] = [];

    if (Config.AUTHORIZED_USERS.split(',').includes(data.login)) {
      scopes.push(AuthorizationScopes.delete, AuthorizationScopes.post);
    }

    const expiration = new Date();
    expiration.setDate(expiration.getDate() + Config.NODE_ENV === 'production' ? 1 : 365);

    const token = await new SignJWT({ scp: scopes })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(Math.floor(expiration.getTime() / 1000))
      .setSubject(user.id)
      .sign(new TextEncoder().encode(Config.JWT_SECRET));

    const accessTokenParts = token.split('.');
    const signature = accessTokenParts.pop() as string;
    accessTokenParts.push('');

    return {
      accessToken: accessTokenParts.join('.'),
      expiration,
      signature,
    };
  }
}

export type IUser = Omit<User, keyof BaseEntity>;

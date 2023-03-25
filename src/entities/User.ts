import axios from 'axios';
import { IsString, IsUUID } from 'class-validator';
import { SignJWT, jwtVerify } from 'jose';
import {
  BaseEntity,
  Column,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { v4 } from 'uuid';
import { AuthorizationScopes, Jwt } from './Jwt';
import { Photo } from './Photo';
import { Post } from './Post';
import { Site } from './Site';
import { ApiMiddleware } from '@middleware/nextConnect';
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

  @OneToMany('photos', 'owner')
  public photos: Photo[];

  @OneToMany('posts', 'owner')
  public posts: Post[];

  @OneToOne('sites')
  public site: Site;

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

    return user.signAccessToken(scopes);
  }

  public static authorize(...scopes: AuthorizationScopes[]) {
    const middleware: ApiMiddleware = async (req, res, next) => {
      const signature = req.cookies['xsrf-token'];
      const match = /^Bearer (\S+)/i.exec(req.headers.authorization || '');

      if (!signature || !match || !match[1]) {
        throw new Error('Unauthenticated');
      }

      let jwt: Jwt;
      try {
        const result = await jwtVerify(
          match[1] + signature,
          new TextEncoder().encode(Config.JWT_SECRET)
        );

        jwt = result.payload as unknown as Jwt;
      } catch {
        throw new APIError(ErrorCode.bad_access_token);
      }

      if (!scopes.every((s) => jwt.scp.includes(s))) {
        throw new Error('Unauthorized');
      }

      req.user = await User.findOneByOrFail({ id: jwt.sub });
      next();
    };

    return middleware;
  }

  private async signAccessToken(scopes: AuthorizationScopes[]) {
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + Config.NODE_ENV === 'production' ? 1 : 365);

    const token = await new SignJWT({ scp: scopes })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(Math.floor(expiration.getTime() / 1000))
      .setSubject(this.id)
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

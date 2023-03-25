import axios from 'axios';
import { transformAndValidate } from 'class-transformer-validator';
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
import { AccessTokenMeta, AuthorizationScopes, Jwt } from './Jwt';
import { Photo } from './Photo';
import { Post } from './Post';
import { Site } from './Site';
import { ApiMiddleware } from '@middleware/nextConnect';
import { Config } from '@utils/config';
import { APIError, ErrorCode } from '@utils/errors';
import { logger } from '@utils/logger';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @IsString()
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  public id: string;

  @Index({ unique: true })
  @Column()
  @IsString()
  public username: string;

  @Index({ unique: true })
  @Column({ nullable: true, type: 'int' })
  public githubId?: number | null;

  @OneToMany('photos', 'owner')
  public photos: Photo[];

  @OneToMany('posts', 'owner')
  public posts: Post[];

  @OneToOne('sites')
  public site: Site;

  public scopes: AuthorizationScopes[] = [];

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
      return user.signAccessToken([AuthorizationScopes.onboard], { githubId: data.id });
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

      // skip db lookup if user is pending an onboard
      if (scopes.every((s) => s === AuthorizationScopes.onboard)) {
        logger.trace('Onboarding user, skipping db lookup');
        req.user = new User();
        req.user.id = jwt.sub;
        req.user.githubId = jwt.meta?.githubId;
        req.user.username = '';
      } else {
        logger.trace('Looking up user');
        req.user = await User.findOneByOrFail({ id: jwt.sub });
      }

      req.user.scopes = jwt.scp;

      logger.trace('User found, validating');

      await transformAndValidate(User, req.user);

      logger.trace('User validated');

      next();
    };

    return middleware;
  }

  private async signAccessToken(scopes: AuthorizationScopes[], meta?: AccessTokenMeta) {
    const expiration = new Date();
    expiration.setDate(expiration.getDate() + Config.NODE_ENV === 'production' ? 1 : 365);

    const token = await new SignJWT({ meta, scp: scopes })
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

export type IUser = Omit<
  User,
  keyof BaseEntity | 'authorize' | 'authorizeGitHub' | 'signAccessToken'
>;

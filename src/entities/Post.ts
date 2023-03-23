import { AWSError } from 'aws-sdk';
import { GetObjectOutput } from 'aws-sdk/clients/s3';
import { PromiseResult } from 'aws-sdk/lib/request';
import { Type } from 'class-transformer';
import { transformAndValidate } from 'class-transformer-validator';
import {
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  IsUppercase,
  Length,
  Max,
  IsEmpty,
  Min,
  ValidateNested,
} from 'class-validator';
import { JWTPayload, jwtVerify, SignJWT } from 'jose';
import sharp from 'sharp';
import { ulid } from 'ulid';
import { Photo } from './Photo';
import { PhotoType } from './PhotoType';
import { Config } from '@utils/config';
import { APIError, ErrorCode } from '@utils/errors';
import { logger } from '@utils/logger';
import { s3 } from '@utils/s3';

const { JWT_SECRET, S3_BUCKET } = Config;

const POSTS_FILE_KEY = '_posts.json';

const ISSUER = 'upload';

export interface UploadToken {
  token: string;
  url: string;
}

export class Post {
  @IsString()
  @IsUppercase()
  public id: string;

  @IsEmpty()
  public countryName?: string;

  @IsDate()
  @Type(() => Date)
  public created: Date;

  @Length(0, 200)
  @IsString()
  @IsOptional()
  public location: string;

  @IsDate()
  @Type(() => Date)
  public updated: Date;

  @Type(() => Photo)
  @ValidateNested({ each: true })
  public photos: Photo[];

  @IsInt()
  @Min(0)
  @Max(255)
  public red: number;

  @IsInt()
  @Min(0)
  @Max(255)
  public green: number;

  @IsInt()
  @Min(0)
  @Max(255)
  public blue: number;

  @Length(0, 200)
  @IsString()
  @IsOptional()
  public title: string;

  public static async processUpload(token: string): Promise<Post> {
    logger.info('Processing upload');
    if (!token) {
      logger.error('No upload token', { token });
      throw new APIError(ErrorCode.no_upload_token);
    }

    let payload: JWTPayload;

    try {
      const verification = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET), {
        clockTolerance: '2 hours',
        issuer: ISSUER,
      });

      payload = verification.payload;
    } catch {
      throw new APIError(ErrorCode.bad_upload_token);
    }

    const { jti, meta } = payload as {
      jti: string;
      meta: { date: string; location?: string; title?: string };
    };

    let object: PromiseResult<GetObjectOutput, AWSError>;
    try {
      object = await s3
        .getObject({
          Bucket: S3_BUCKET,
          Key: this.getProcessingKey(jti),
        })
        .promise();
    } catch (e) {
      if ((e as AWSError).code === 'NoSuchKey') {
        throw new APIError(ErrorCode.no_file_received);
      }

      throw e;
    }

    await s3.deleteObject({ Bucket: S3_BUCKET, Key: this.getProcessingKey(jti) }).promise();

    const buffer = Buffer.from(object.Body.toString('base64'), 'base64');

    const image = sharp(buffer);

    const photo = await Photo.upload(image, PhotoType.ORIGINAL);

    // get average color
    const { channels } = await image.stats();
    const [r, g, b] = channels.map((c) => Math.floor(c.mean));

    const id = ulid();

    const post = await transformAndValidate(
      Post,
      {
        blue: b,
        created: new Date(meta.date),
        green: g,
        id,
        location: meta.location,
        photos: [photo],
        red: r,
        title: meta.title,
        updated: new Date(),
      },
      { validator: { forbidUnknownValues: true } }
    ).catch((err) => {
      logger.error(err, 'Post failed validation');
      throw err;
    });
    logger.info('Post passed validation');

    await Post.addPostToIndex(post);
    logger.info('Post added to index');

    return post;
  }

  public static async requestUploadToken(
    location?: string,
    title?: string,
    date = new Date()
  ): Promise<UploadToken> {
    logger.info('Creating upload token', { date, location, title });
    const id = ulid();

    const [token, url] = await Promise.all([
      new SignJWT({
        meta: {
          date: new Date(date),
          location,
          title,
        },
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setJti(id)
        .setIssuedAt()
        .setIssuer(ISSUER)
        .setExpirationTime('3m')
        .sign(new TextEncoder().encode(JWT_SECRET)),
      s3.getSignedUrlPromise('putObject', {
        Bucket: S3_BUCKET,
        Expires: 60 * 2,
        Key: this.getProcessingKey(id),
      }),
    ]);

    return { token, url };
  }

  private static async addPostToIndex(post: Post): Promise<void> {
    logger.info('Adding post to index', { post });
    const posts = await this.getAll();
    posts.unshift(post);
    posts.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
    await this.writePostsIndex(posts);
  }

  private static async writePostsIndex(posts: Post[]): Promise<void> {
    logger.info('Writing posts index', { posts });

    await s3
      .upload({
        ACL: 'public-read',
        Body: JSON.stringify(
          await transformAndValidate(Post, posts, {
            validator: { forbidUnknownValues: true },
          })
        ),
        Bucket: S3_BUCKET,
        ContentType: 'application/json',
        Key: POSTS_FILE_KEY,
      })
      .promise();
  }

  public static async update(
    id: string,
    data: Partial<Pick<Post, 'created' | 'location' | 'title'>>
  ): Promise<Post> {
    logger.info('Updating post', { data, id });
    const posts = await this.getAll();

    const index = posts.findIndex((p) => p.id === id);

    if (!~index) {
      logger.error('No post index found', { id, index });
      throw new APIError(ErrorCode.post_not_found);
    }

    const [post] = posts.splice(index, 1);

    if (!post) {
      logger.error('No post found', { id, index, post });
      throw new APIError(ErrorCode.post_not_found);
    }

    logger.info('Post found', { data, id, post });

    if (data.created) {
      logger.info('Updating post date', { new: data.created, original: post.created });
      post.created = new Date(data.created);
    }

    if (data.location) {
      logger.info('Updating post location', { new: data.location, original: post.location });
      post.location = data.location;
    }

    if (data.title) {
      logger.info('Updating post title', { new: data.title, original: post.title });
      post.title = data.title;
    }

    post.updated = new Date();
    posts.unshift(post);
    await this.writePostsIndex(posts);
    return post;
  }

  public static async getAll(): Promise<Post[]> {
    try {
      logger.info('Looking up post index');
      const { Body } = await s3
        .getObject({
          Bucket: S3_BUCKET,
          Key: POSTS_FILE_KEY,
        })
        .promise();

      const json = Body.toString();

      logger.info('Post data found');

      const posts = (await transformAndValidate(Post, json, {
        validator: { forbidUnknownValues: true },
      })) as Post[];

      return posts;
    } catch (err) {
      if (err?.code === 'NoSuchKey') {
        return [];
      }

      throw err;
    }
  }

  public static async delete(id: string): Promise<void> {
    logger.info('Deleting post', { id });
    const posts = await this.getAll();

    const index = posts.findIndex((p) => p.id === id);

    if (!~index) {
      logger.error('Post not found', { id, index });
      throw new APIError(ErrorCode.post_not_found);
    }

    const [post] = posts.splice(index, 1);

    await Promise.all(post.photos.map((p) => p.delete()));

    await this.writePostsIndex(posts);
  }

  private static getProcessingKey(key: string): string {
    return `processing/${key}`;
  }
}

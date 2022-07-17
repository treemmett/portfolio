import { readFile } from 'fs/promises';
import { Type } from 'class-transformer';
import { transformAndValidate } from 'class-transformer-validator';
import {
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import sharp from 'sharp';
import { v4 as uuid } from 'uuid';
import { Config } from '../utils/config';
import { APIError, ErrorCode } from '../utils/errors';
import { logger } from '../utils/logger';
import { s3 } from '../utils/s3';
import { Photo } from './Photo';
import { PhotoType } from './PhotoType';

const { S3_BUCKET } = Config;

const POSTS_FILE_KEY = 'posts.json';

export class Post {
  @IsUUID()
  public id: string;

  @IsDate()
  @Type(() => Date)
  public created: Date;

  @Length(0, 200)
  @IsString()
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

  public static async upload(
    filePath: string,
    title: string,
    location: string,
    date?: Date
  ): Promise<Post> {
    logger.verbose('Uploading post', { date, filePath, location, title });
    if (!filePath) {
      logger.error('No filepath received', { filePath });
      throw new APIError(ErrorCode.no_file_received, 400, 'No file uploaded');
    }

    const imageBuffer = await readFile(filePath);
    if (!imageBuffer.length) {
      logger.error('Empty file buffer', { filePath });
      throw new APIError(ErrorCode.no_file_received, 400, 'No file uploaded');
    }

    const image = sharp(imageBuffer);

    const photo = await Photo.upload(image, PhotoType.ORIGINAL);

    // get average color
    const { channels } = await image.stats();
    const [r, g, b] = channels.map((c) => Math.floor(c.mean));

    const post = await transformAndValidate(
      Post,
      {
        blue: b,
        created: new Date(date),
        green: g,
        id: uuid(),
        location,
        photos: [photo],
        red: r,
        title,
        updated: new Date(),
      },
      { validator: { forbidUnknownValues: true } }
    );
    logger.verbose('Post passed validation');

    await Post.addPostToIndex(post);
    logger.verbose('Post added to index');

    return post;
  }

  private static async addPostToIndex(post: Post): Promise<void> {
    logger.verbose('Adding post to index', { post });
    const posts = await this.getAll();
    posts.unshift(post);
    posts.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
    await this.writePostsIndex(posts);
  }

  private static async writePostsIndex(posts: Post[]): Promise<void> {
    logger.verbose('Writing posts index', { posts });
    await s3
      .upload({
        ACL: 'public-read',
        Body: JSON.stringify(posts),
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
    logger.verbose('Updating post', { data, id });
    const posts = await this.getAll();

    const index = posts.findIndex((p) => p.id === id);

    if (!~index) {
      logger.error('No post index found', { id, index });
      throw new APIError(ErrorCode.post_not_found, 404, 'Post not found');
    }

    const [post] = posts.splice(index, 1);

    if (!post) {
      logger.error('No post found', { id, index, post });
      throw new APIError(ErrorCode.post_not_found, 404, 'Post not found');
    }

    logger.verbose('Post found', { data, id, post });

    if (data.created) {
      logger.verbose('Updating post date', { new: data.created, original: post.created });
      post.created = new Date(data.created);
    }

    if (data.location) {
      logger.verbose('Updating post location', { new: data.location, original: post.location });
      post.location = data.location;
    }

    if (data.title) {
      logger.verbose('Updating post title', { new: data.title, original: post.title });
      post.title = data.title;
    }

    post.updated = new Date();
    posts.unshift(post);
    await this.writePostsIndex(posts);
    return post;
  }

  public static async getAll(): Promise<Post[]> {
    try {
      logger.verbose('Looking up post index');
      const { Body } = await s3
        .getObject({
          Bucket: S3_BUCKET,
          Key: POSTS_FILE_KEY,
        })
        .promise();

      const json = Body.toString();

      logger.verbose('Post data found', { json });

      return (await transformAndValidate(Post, json, {
        validator: { forbidUnknownValues: true },
      })) as Post[];
    } catch (err) {
      if (err?.code === 'NoSuchKey') {
        return [];
      }

      throw err;
    }
  }

  public static async delete(id: string): Promise<void> {
    logger.verbose('Deleting post', { id });
    const posts = await this.getAll();

    const index = posts.findIndex((p) => p.id === id);

    if (!~index) {
      logger.error('Post not found', { id, index });
      throw new APIError(ErrorCode.post_not_found, 404, 'Post not found');
    }

    posts.splice(index, 1);

    await this.writePostsIndex(posts);
  }
}

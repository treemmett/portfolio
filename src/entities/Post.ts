import { readFile } from 'fs/promises';
import { Type } from 'class-transformer';
import { transformAndValidate } from 'class-transformer-validator';
import { IsDate, IsInt, IsString, IsUUID, Length, Max, Min, ValidateNested } from 'class-validator';
import sharp from 'sharp';
import { v4 as uuid } from 'uuid';
import { Config } from '../utils/config';
import { APIError, ErrorCode } from '../utils/errors';
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
  public title: string;

  public static async upload(
    filePath: string,
    title: string,
    location: string,
    date?: Date
  ): Promise<Post> {
    if (!filePath) {
      throw new APIError(ErrorCode.no_file_received, 400, 'No file uploaded');
    }

    const imageBuffer = await readFile(filePath);
    if (!imageBuffer.length) {
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

    await Post.addPostToIndex(post);

    return post;
  }

  private static async addPostToIndex(post: Post): Promise<void> {
    const posts = await this.getAll();
    posts.unshift(post);
    posts.sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime());
    await this.writePostsIndex(posts);
  }

  private static async writePostsIndex(posts: Post[]): Promise<void> {
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
    const posts = await this.getAll();

    const index = posts.findIndex((p) => p.id === id);

    if (!~index) {
      throw new APIError(ErrorCode.post_not_found, 404, 'Post not found');
    }

    const [post] = posts.splice(index, 1);

    if (!post) {
      throw new APIError(ErrorCode.post_not_found, 404, 'Post not found');
    }

    if (data.created) {
      post.created = new Date(data.created);
    }

    if (data.location) {
      post.location = data.location;
    }

    if (data.title) {
      post.title = data.title;
    }

    post.updated = new Date();
    posts.unshift(post);
    await this.writePostsIndex(posts);
    return post;
  }

  public static async getAll(): Promise<Post[]> {
    try {
      const { Body } = await s3
        .getObject({
          Bucket: S3_BUCKET,
          Key: POSTS_FILE_KEY,
        })
        .promise();

      const json = Body.toString();

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
    const posts = await this.getAll();

    const index = posts.findIndex((p) => p.id === id);

    if (!~index) {
      throw new APIError(ErrorCode.post_not_found, 404, 'Post not found');
    }

    posts.splice(index, 1);

    await this.writePostsIndex(posts);
  }
}

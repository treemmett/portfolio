import 'reflect-metadata';
import { readFile } from 'fs/promises';
import { Type } from 'class-transformer';
import { transformAndValidate } from 'class-transformer-validator';
import { IsDate, IsInt, IsUUID, Length, Max, Min, ValidateNested } from 'class-validator';
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
  public title: string;

  public static async upload(filePath: string, title: string): Promise<Post> {
    if (!filePath) {
      throw new APIError(ErrorCode.no_file_received, 400, 'No file uploaded');
    }

    const imageBuffer = await readFile(filePath);
    if (!imageBuffer.length) {
      throw new APIError(ErrorCode.no_file_received, 400, 'No file uploaded');
    }

    const image = sharp(imageBuffer);

    const tasks: Promise<Photo>[] = [Photo.upload(image, PhotoType.ORIGINAL)];

    // scale and blur images to the given dimensions
    [1000].map(async (size) => {
      const scaledImage = image.clone();
      scaledImage.resize(size, size, { fit: 'inside' });
      tasks.push(Photo.upload(scaledImage, PhotoType.SCALED));

      const blurredImage = scaledImage.clone();
      blurredImage.blur();
      tasks.push(Photo.upload(blurredImage, PhotoType.BLURRED));
    });

    const photos = await Promise.all(tasks);

    // get average color
    const { channels } = await image.stats();
    const [r, g, b] = channels.map((c) => Math.floor(c.mean));

    const post = await transformAndValidate(
      Post,
      {
        blue: b,
        created: new Date(),
        green: g,
        id: uuid(),
        photos,
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

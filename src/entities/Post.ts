import 'reflect-metadata';
import { readFile } from 'fs/promises';
import { plainToClass, plainToInstance, Type } from 'class-transformer';
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
  public id: string;

  public created: Date;

  public updated: Date;

  @Type(() => Photo)
  public photos: Photo[];

  public red: number;

  public green: number;

  public blue: number;

  public static async upload(filePath: string): Promise<Post> {
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

    const post = plainToClass(Post, {
      blue: b,
      created: new Date(),
      green: g,
      id: uuid(),
      photos,
      red: r,
      updated: new Date(),
    });

    await Post.writePostsIndex([post]);

    return post;
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
    const { Body } = await s3
      .getObject({
        Bucket: S3_BUCKET,
        Key: POSTS_FILE_KEY,
      })
      .promise();

    const json = Body.toString();

    return JSON.parse(json).map((value) => plainToInstance(Post, value));
  }
}

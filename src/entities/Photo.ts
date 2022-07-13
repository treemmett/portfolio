import { plainToClass } from 'class-transformer';
import { Sharp } from 'sharp';
import { v4 } from 'uuid';
import { Config } from '../utils/config';
import { s3 } from '../utils/s3';
import { PhotoType } from './PhotoType';
import { Post } from './Post';

const { CDN_URL, S3_BUCKET, S3_URL } = Config;

export class Photo {
  public id: string;

  public created: Date;

  public post: Post;

  public height: number;

  /**
   * base64 data uri of the scaled down thumbnail
   */
  public thumbnailURL: string;

  public type: PhotoType;

  public updated: Date;

  public url: string;

  public width: number;

  public afterLoad() {
    this.url = CDN_URL ? `${CDN_URL}/${this.id}` : `${S3_URL}/${S3_BUCKET}/${this.id}`;
  }

  public static async upload(image: Sharp, type: PhotoType = PhotoType.ORIGINAL): Promise<Photo> {
    const id = v4();

    const mime = 'image/webp';

    await s3
      .upload({
        ACL: 'public-read',
        Body: await image.webp().toBuffer(),
        Bucket: S3_BUCKET,
        ContentType: mime,
        Key: id,
      })
      .promise();

    const thumbnail = image.clone();
    thumbnail.resize(20, 20, { fit: 'inside' });

    const [metadata, thumbnailBuffer] = await Promise.all([
      image.metadata(),
      thumbnail.webp().toBuffer(),
    ]);

    const photo = plainToClass(Photo, {
      created: new Date(),
      height: metadata.height,
      id,
      thumbnailURL: `data:${mime};base64,${thumbnailBuffer.toString('base64')}`,
      type,
      updated: new Date(),
      width: metadata.width,
    });

    return photo;
  }
}

import { Transform } from 'class-transformer';
import { transformAndValidate } from 'class-transformer-validator';
import { IsDataURI, IsEnum, IsInt, IsString, IsUppercase, Min } from 'class-validator';
import { Sharp } from 'sharp';
import { ulid } from 'ulid';
import { PhotoType } from './PhotoType';
import { Config } from '@utils/config';
import { logger } from '@utils/logger';
import { s3 } from '@utils/s3';

const { CDN_URL, S3_BUCKET, S3_URL } = Config;

export class Photo {
  @IsString()
  @IsUppercase()
  public id: string;

  @IsInt()
  public height: number;

  /**
   * size in bytes
   */
  @IsInt()
  @Min(0)
  public size: number;

  /**
   * base64 data uri of the scaled down thumbnail
   */
  @IsDataURI()
  public thumbnailURL: string;

  @IsEnum(PhotoType)
  public type: PhotoType;

  @Transform(({ obj }: { obj: Photo }) =>
    CDN_URL ? `${CDN_URL}/${obj.id}` : `${S3_URL}/${S3_BUCKET}/${obj.id}`
  )
  public url: string;

  @IsInt()
  public width: number;

  public async delete(): Promise<void> {
    await s3.deleteObject({ Bucket: S3_BUCKET, Key: this.id }).promise();
  }

  public static async upload(image: Sharp, type: PhotoType = PhotoType.ORIGINAL): Promise<Photo> {
    logger.info('Uploading photo', await image.metadata());
    const id = ulid();

    // ensure orientation is correct
    image.rotate();

    const mime = 'image/webp';

    const buffer = await image.webp().toBuffer();

    await s3
      .upload({
        ACL: 'public-read',
        Body: buffer,
        Bucket: S3_BUCKET,
        ContentType: mime,
        Key: id,
      })
      .promise();

    logger.info('Successfully uploaded to S3');

    logger.info('Creating thumbnail');
    const thumbnail = image.clone();
    thumbnail.resize(20, 20, { fit: 'inside' });

    const [metadata, thumbnailBuffer] = await Promise.all([
      image.metadata(),
      thumbnail.webp().toBuffer(),
    ]);
    logger.info('Thumbnail and metadata created');

    const photo = await transformAndValidate(
      Photo,
      {
        height: metadata.height,
        id,
        size: buffer.length,
        thumbnailURL: `data:${mime};base64,${thumbnailBuffer.toString('base64')}`,
        type,
        url: CDN_URL ? `${CDN_URL}/${id}` : `${S3_URL}/${S3_BUCKET}/${id}`,
        width: metadata.width,
      } as Photo,
      {
        validator: {
          forbidUnknownValues: true,
        },
      }
    );

    logger.info('Photo passed validation');

    return photo;
  }
}

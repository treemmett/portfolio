import { Transform } from 'class-transformer';
import { transformAndValidate } from 'class-transformer-validator';
import { IsDataURI, IsEnum, IsInt, IsString, IsUppercase } from 'class-validator';
import { Sharp } from 'sharp';
import { ulid } from 'ulid';
import { Config } from '../utils/config';
import { logger } from '../utils/logger';
import { s3 } from '../utils/s3';
import { PhotoType } from './PhotoType';

const { CDN_URL, S3_BUCKET, S3_URL } = Config;

export class Photo {
  @IsString()
  @IsUppercase()
  public id: string;

  @IsInt()
  public height: number;

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

  public static async upload(image: Sharp, type: PhotoType = PhotoType.ORIGINAL): Promise<Photo> {
    logger.info('Uploading photo', await image.metadata());
    const id = ulid();

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
        thumbnailURL: `data:${mime};base64,${thumbnailBuffer.toString('base64')}`,
        type,
        width: metadata.width,
      },
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

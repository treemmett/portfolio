import { AWSError } from 'aws-sdk';
import { GetObjectOutput } from 'aws-sdk/clients/s3';
import { PromiseResult } from 'aws-sdk/lib/request';
import { Transform, Type } from 'class-transformer';
import { transformAndValidate } from 'class-transformer-validator';
import { IsDataURI, IsEnum, IsInt, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { parse as parseExif } from 'exifr';
import { JWTPayload, SignJWT, jwtVerify } from 'jose';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { v4 } from 'uuid';
import { PhotoType } from './PhotoType';
import { Site } from './Site';
import { User } from './User';
import { WatermarkPosition } from './WatermarkPosition';
import { Config } from '@utils/config';
import {
  BadUploadTokenError,
  ImageProcessingError,
  NoFileReceivedError,
  UnauthorizedError,
} from '@utils/errors';
import { logger } from '@utils/logger';
import { s3 } from '@utils/s3';

// import sharp, { OutputInfo, Sharp } from 'sharp';
function sharp(...args: any[]) {
  return {} as Sharp;
}
type OutputInfo = any;
type Sharp = any;

const { CDN_URL, S3_BUCKET, S3_URL } = Config;

export interface UploadToken {
  token: string;
  url: string;
}

@Entity({ name: 'photos' })
export class Photo extends BaseEntity {
  @IsString()
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  public id: string;

  @Type(() => User)
  @ValidateNested()
  @ManyToOne('users', { nullable: false })
  public owner: User;

  @IsInt()
  @Column()
  public height: number;

  /**
   * size in bytes
   */
  @IsInt()
  @Column()
  @Min(0)
  public size: number;

  /**
   * base64 data uri of the scaled down thumbnail
   */
  @IsDataURI()
  @Column()
  public thumbnailURL: string;

  @IsEnum(PhotoType)
  @Column({
    enum: PhotoType,
    type: 'enum',
  })
  public type: PhotoType;

  @Transform(({ obj }: { obj: Photo }) =>
    CDN_URL ? `${CDN_URL}/${obj.id}` : `${S3_URL}/${S3_BUCKET}/${obj.id}`,
  )
  public url = '';

  @IsInt()
  @Column()
  public width: number;

  public static async getUploadToken(user: User, type: PhotoType): Promise<UploadToken> {
    logger.trace('Creating upload token');
    const id = v4();

    const [token, url] = await Promise.all([
      new SignJWT({ type })
        .setProtectedHeader({ alg: 'HS256' })
        .setJti(id)
        .setSubject(user.id)
        .setIssuedAt()
        .setExpirationTime('3m')
        .sign(new TextEncoder().encode(Config.JWT_SECRET)),
      s3.getSignedUrlPromise('putObject', {
        Bucket: S3_BUCKET,
        Expires: 60 * 2,
        Key: `processing/${id}`,
      }),
    ]);

    return { token, url };
  }

  public static async addPhoto(
    image: Sharp,
    user: User,
    type: PhotoType,
    id?: string,
  ): Promise<{ image: Sharp; imageInfo: OutputInfo; photo: Photo }> {
    image.rotate().webp().sharpen({ m2: 2, sigma: 0.75 });

    const [imageData, thumbnailBuffer] = await Promise.all([
      image.toBuffer({ resolveWithObject: true }),
      image.clone().resize(20, 20, { fit: 'inside' }).webp().toBuffer(),
    ]);

    logger.trace('Photo processed');

    const realId = id || v4();

    const photo = await transformAndValidate(
      Photo,
      {
        height: imageData.info.height,
        id: realId,
        owner: user,
        size: imageData.info.size,
        thumbnailURL: `data:image/${imageData.info.format};base64,${thumbnailBuffer.toString(
          'base64',
        )}`,
        type,
        url: CDN_URL ? `${CDN_URL}/${realId}` : `${S3_URL}/${S3_BUCKET}/${realId}`,
        width: imageData.info.width,
      } as Photo,
      {
        validator: {
          forbidUnknownValues: true,
        },
      },
    );

    const [savedPhoto] = await Promise.all([
      photo.save(),
      s3
        .upload({
          ACL: 'public-read',
          Body: imageData.data,
          Bucket: S3_BUCKET,
          ContentType: 'image/webp',
          Key: realId,
        })
        .promise(),
    ]);

    return {
      image,
      imageInfo: imageData.info,
      photo: savedPhoto,
    };
  }

  public static async processUpload(user: User, token: string, includeWatermark?: boolean) {
    logger.trace({ token, user }, 'Processing upload');

    if (!token) {
      logger.error('No upload token', { token });
      throw new BadUploadTokenError('No upload token');
    }

    let payload: JWTPayload & { type: PhotoType };

    try {
      const verification = await jwtVerify(token, new TextEncoder().encode(Config.JWT_SECRET), {
        clockTolerance: '1 minute',
      });

      payload = verification.payload as typeof payload;
    } catch {
      throw new BadUploadTokenError();
    }

    if (payload.sub !== user.id) {
      throw new UnauthorizedError('Invalid token subject');
    }

    const { jti } = payload as {
      jti: string;
    };

    let object: PromiseResult<GetObjectOutput, AWSError>;
    try {
      object = await s3
        .getObject({
          Bucket: S3_BUCKET,
          Key: `processing/${jti}`,
        })
        .promise();
    } catch (e) {
      if ((e as AWSError).code === 'NoSuchKey') {
        throw new NoFileReceivedError();
      }

      throw e;
    }

    if (!object.Body) throw new NoFileReceivedError();

    logger.trace({ key: `processing/${jti}` }, 'Loading object');

    await s3.deleteObject({ Bucket: S3_BUCKET, Key: `processing/${jti}` }).promise();

    const uploadedPhoto = object.Body as Buffer;

    logger.trace('Object loaded');

    let image = sharp(uploadedPhoto);

    if (includeWatermark) {
      logger.trace('Watermark requested');
      image = await Photo.applyWatermark(image, user);
    }

    const [photo, exifData] = await Promise.all([
      Photo.addPhoto(image, user, payload.type, payload.jti),
      parseExif(uploadedPhoto) as {
        DateTimeOriginal?: Date;
        latitude?: number;
        longitude?: number;
      },
    ]);

    return { ...photo, exifData };
  }

  private static async applyWatermark(image: Sharp, user: User): Promise<Sharp> {
    logger.trace('Applying watermark');

    const site = await Site.getByUsername(user.username);

    if (!site.logo) {
      logger.trace('No logo, skipping watermark');
      return image;
    }

    if (typeof site.watermarkPosition !== 'number') {
      logger.trace('Watermark position not set, skipping');
      return image;
    }

    const logoObject = await s3
      .getObject({
        Bucket: S3_BUCKET,
        Key: site.logo.id,
      })
      .promise();

    if (!logoObject.Body) {
      throw new NoFileReceivedError('Logo not found');
    }

    const [imageMetadata, logoImage] = await Promise.all([
      image.metadata(),
      sharp(Buffer.from(logoObject.Body.toString('base64'), 'base64'))
        .resize(200, 200, { fit: 'inside' })
        .sharpen({ m2: 2, sigma: 0.75 })
        .toBuffer({ resolveWithObject: true }),
    ]);

    if (typeof imageMetadata.height !== 'number' || typeof imageMetadata.width !== 'number') {
      throw new ImageProcessingError('Unable to obtain image dimensions');
    }

    const PADDING = 40;

    let gravity: string | null = null;
    let top = 0;
    let left = 0;
    switch (site.watermarkPosition) {
      case WatermarkPosition.BOTTOM_LEFT:
        left = PADDING;
        top = imageMetadata.height - logoImage.info.height - PADDING;
        gravity = 'southwest';
        break;

      case WatermarkPosition.BOTTOM_RIGHT:
        left = imageMetadata.width - logoImage.info.width - PADDING;
        top = imageMetadata.height - logoImage.info.height - PADDING;
        gravity = 'southeast';
        break;

      case WatermarkPosition.TOP_LEFT:
        left = PADDING;
        top = PADDING;
        gravity = 'northwest';
        break;

      case WatermarkPosition.TOP_RIGHT:
        left = imageMetadata.width - logoImage.info.width - PADDING;
        top = PADDING;
        gravity = 'northeast';
        break;

      default:
        break;
    }

    if (!gravity) {
      throw new ImageProcessingError('Invalid gravity');
    }

    logger.trace('Applying alpha');
    const logoBuffer = await sharp(logoImage.data)
      .ensureAlpha(0.75)
      .webp()
      .sharpen({ m2: 2, sigma: 0.75 })
      .toBuffer();

    logger.trace('Compositing');

    const compositedBuffer = await image
      .composite([{ input: logoBuffer, left, top }])
      .webp()
      .sharpen({ m2: 2, sigma: 0.75 })
      .toBuffer();

    logger.trace('Watermark applied');

    return sharp(compositedBuffer);
  }

  public static async getStats(user: User): Promise<PhotoStats> {
    const results = await Photo.createQueryBuilder('photo')
      .leftJoin('photo.owner', 'user')
      .select('SUM(photo.size)', 'size')
      .addSelect('COUNT(*)')
      .where('user.id = :id', { id: user.id })
      .andWhere('photo.type = :type', { type: PhotoType.ORIGINAL })
      .getRawOne();

    return results;
  }

  /**
   * Delete photo from S3 and remove from database
   */
  public async delete() {
    await s3.deleteObject({ Bucket: S3_BUCKET, Key: this.id }).promise();
    await this.remove();
  }
}

export type IPhoto = Omit<Photo, keyof BaseEntity | 'upload'>;

export interface PhotoStats {
  count: number;
  size: number;
}

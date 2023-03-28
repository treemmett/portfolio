import { AWSError } from 'aws-sdk';
import { GetObjectOutput } from 'aws-sdk/clients/s3';
import { PromiseResult } from 'aws-sdk/lib/request';
import { Transform, Type } from 'class-transformer';
import { transformAndValidate } from 'class-transformer-validator';
import { IsDataURI, IsEnum, IsInt, IsString, IsUUID, Min, ValidateNested } from 'class-validator';
import { JWTPayload, SignJWT, jwtVerify } from 'jose';
import sharp, { Metadata, OutputInfo, Sharp } from 'sharp';
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { v4 } from 'uuid';
import { PhotoType } from './PhotoType';
import { User } from './User';
import { Config } from '@utils/config';
import { BadUploadTokenError, NoFileReceivedError, UnauthorizedError } from '@utils/errors';
import { logger } from '@utils/logger';
import { s3 } from '@utils/s3';

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
    CDN_URL ? `${CDN_URL}/${obj.id}` : `${S3_URL}/${S3_BUCKET}/${obj.id}`
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
    id?: string
  ): Promise<{ image: Sharp; imageInfo: OutputInfo; metadata: Metadata; photo: Photo }> {
    image.rotate().webp();

    const [imageData, thumbnailBuffer, metadata] = await Promise.all([
      image.toBuffer({ resolveWithObject: true }),
      image.clone().resize(20, 20, { fit: 'inside' }).webp().toBuffer(),
      image.metadata(),
    ]);

    logger.trace('Photo processed');

    const realId = id || v4();

    const photo = await transformAndValidate(
      Photo,
      {
        height: metadata.height,
        id: realId,
        owner: user,
        size: imageData.info.size,
        thumbnailURL: `data:image/${imageData.info.format};base64,${thumbnailBuffer.toString(
          'base64'
        )}`,
        type,
        url: CDN_URL ? `${CDN_URL}/${realId}` : `${S3_URL}/${S3_BUCKET}/${realId}`,
        width: metadata.width,
      } as Photo,
      {
        validator: {
          forbidUnknownValues: true,
        },
      }
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
      metadata,
      photo: savedPhoto,
    };
  }

  public static async processUpload(user: User, token: string) {
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

    await s3.deleteObject({ Bucket: S3_BUCKET, Key: `processing/${jti}` }).promise();

    const image = sharp(Buffer.from(object.Body.toString('base64'), 'base64'));

    return Photo.addPhoto(image, user, payload.type, payload.jti);
  }
}

export type IPhoto = Omit<Photo, keyof BaseEntity | 'upload'>;

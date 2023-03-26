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
  IsUUID,
  Length,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { JWTPayload, jwtVerify, SignJWT } from 'jose';
import sharp from 'sharp';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 } from 'uuid';
import { Photo, IPhoto } from './Photo';
import { PhotoType } from './PhotoType';
import { User } from './User';
import { Config } from '@utils/config';
import { APIError, ErrorCode } from '@utils/errors';
import { logger } from '@utils/logger';
import { s3 } from '@utils/s3';

const { JWT_SECRET, S3_BUCKET } = Config;

const ISSUER = 'upload';

export interface UploadToken {
  token: string;
  url: string;
}

@Entity({ name: 'posts' })
export class Post extends BaseEntity {
  @IsString()
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  public id: string;

  @Type(() => User)
  @ValidateNested()
  @ManyToOne('users', { nullable: false })
  public owner: User;

  @IsDate()
  @Type(() => Date)
  @CreateDateColumn()
  public created: string;

  @Length(0, 200)
  @IsString()
  @IsOptional()
  @Column({ nullable: true, type: 'varchar' })
  public location?: string | null;

  @IsDate()
  @Type(() => Date)
  @UpdateDateColumn()
  public updated: Date;

  @Type(() => Photo)
  @ValidateNested()
  @OneToOne('photos')
  @JoinColumn()
  public photo: Photo;

  @IsInt()
  @Min(0)
  @Max(255)
  @Column({ type: 'smallint' })
  public red: number;

  @IsInt()
  @Min(0)
  @Max(255)
  @Column({ type: 'smallint' })
  public green: number;

  @IsInt()
  @Min(0)
  @Max(255)
  @Column({ type: 'smallint' })
  public blue: number;

  @Length(0, 200)
  @IsString()
  @IsOptional()
  @Column({ nullable: true, type: 'varchar' })
  public title?: string | null;

  public static async processUpload(token: string, user: User): Promise<Post> {
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

    const { jti } = payload as {
      jti: string;
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

    if (!object.Body) throw new APIError(ErrorCode.no_file_received);

    await s3.deleteObject({ Bucket: S3_BUCKET, Key: this.getProcessingKey(jti) }).promise();

    const buffer = Buffer.from(object.Body.toString('base64'), 'base64');

    const image = sharp(buffer);

    const photo = await Photo.upload(image, user, PhotoType.ORIGINAL);

    // get average color
    const { channels } = await image.stats();
    const [r, g, b] = channels.map((c) => Math.floor(c.mean));

    const id = v4();

    const post = await transformAndValidate(
      Post,
      {
        blue: b,
        created: new Date(),
        green: g,
        id,
        owner: user,
        photo,
        red: r,
        updated: new Date(),
      },
      { validator: { forbidUnknownValues: true } }
    ).catch((err) => {
      logger.error(err, 'Post failed validation');
      throw err;
    });
    logger.info('Post passed validation');

    await post.save();

    logger.info('Post added to index');

    return post;
  }

  public static async requestUploadToken(): Promise<UploadToken> {
    logger.info('Creating upload token');
    const id = v4();

    const [token, url] = await Promise.all([
      new SignJWT({})
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

  public static async getById(id: string): Promise<Post> {
    const post = await Post.findOneOrFail({ relations: { photo: true }, where: { id } });
    return transformAndValidate(Post, post);
  }

  public static async getAll(): Promise<Post[]> {
    const posts = await Post.find({
      relations: {
        photo: true,
      },
    });

    return transformAndValidate(Post, posts);
  }

  public static async getAllFromUser(username: string): Promise<Post[]> {
    const posts = await Post.createQueryBuilder('post')
      .select()
      .leftJoinAndSelect('post.photo', 'photo')
      .leftJoin('post.owner', 'user')
      .where('user.username = :username', { username })
      .getMany();

    return transformAndValidate(Post, posts);
  }

  private static getProcessingKey(key: string): string {
    return `processing/${key}`;
  }
}

export interface IPost
  extends Omit<
    Post,
    keyof BaseEntity | 'photo' | 'processUpload' | 'requestUploadToken' | 'getProcessingKey'
  > {
  photo: IPhoto;
}

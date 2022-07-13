import { Credentials, Endpoint, S3 } from 'aws-sdk';
import { plainToClass } from 'class-transformer';
import { Sharp } from 'sharp';
import { Field, ID, Int, ObjectType } from 'type-graphql';
import {
  AfterInsert,
  AfterLoad,
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 } from 'uuid';
import { Config } from '../utils/config';
import { PhotoType } from './PhotoType';
import { Post } from './Post';

const { CDN_URL, S3_BUCKET, S3_KEY, S3_KEY_SECRET, S3_URL } = Config;

@Entity({ name: 'photos' })
@ObjectType()
export class Photo extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  public id: string;

  @CreateDateColumn()
  @Field()
  public created: Date;

  @ManyToOne(() => Post, (p) => p.photos)
  @Field(() => Post)
  public post: Post;

  @Column({ nullable: false })
  @Field(() => Int)
  public height: number;

  /**
   * base64 data uri of the scaled down thumbnail
   */
  @Column()
  public thumbnailURL: string;

  @Column({ enum: PhotoType, type: 'enum' })
  @Field(() => PhotoType)
  public type: PhotoType;

  @UpdateDateColumn()
  @Field()
  public updated: Date;

  @Field()
  public url: string;

  @Column({ nullable: false })
  @Field(() => Int)
  public width: number;

  @AfterLoad()
  @AfterInsert()
  public afterLoad() {
    this.url = CDN_URL ? `${CDN_URL}/${this.id}` : `${S3_URL}/${S3_BUCKET}/${this.id}`;
  }

  public static async upload(image: Sharp, type: PhotoType = PhotoType.ORIGINAL): Promise<Photo> {
    const id = v4();

    const space = new S3({
      credentials: new Credentials({
        accessKeyId: S3_KEY,
        secretAccessKey: S3_KEY_SECRET,
      }),
      endpoint: new Endpoint(S3_URL),
      s3ForcePathStyle: true,
      signatureVersion: 'v4',
    });

    const mime = 'image/webp';

    await space
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
      height: metadata.height,
      id,
      thumbnailURL: `data:${mime};base64,${thumbnailBuffer.toString('base64')}`,
      type,
      width: metadata.width,
    });

    // catch future errors to remove uploaded file
    try {
      return await photo.save();
    } catch (err) {
      await space
        .deleteObject({
          Bucket: S3_BUCKET,
          Key: id,
        })
        .promise();

      throw err;
    }
  }
}

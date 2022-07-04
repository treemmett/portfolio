import { Credentials, Endpoint, S3 } from 'aws-sdk';
import { plainToClass } from 'class-transformer';
import Jimp from 'jimp';
import { Field, ID, Int, ObjectType } from 'type-graphql';
import {
  AfterInsert,
  AfterLoad,
  Column,
  CreateDateColumn,
  Entity,
  getRepository,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 } from 'uuid';
import { Config } from '../utils/config';
import { PhotoType } from './PhotoType';
import { Post } from './Post';

const { CDN_URL, S3_BUCKET, S3_KEY, S3_KEY_SECRET, S3_URL } = Config;
const TABLE_NAME = 'photos';

@Entity({ name: TABLE_NAME })
@ObjectType()
export class Photo {
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

  public static repository() {
    return getRepository<Photo>(TABLE_NAME);
  }

  public static async getAll(): Promise<Photo[]> {
    return Photo.repository().find();
  }

  public static async upload(image: Jimp, type: PhotoType = PhotoType.ORIGINAL): Promise<Photo> {
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

    const mime = image.getMIME();

    await space
      .upload({
        ACL: 'public-read',
        Body: await image.getBufferAsync(mime),
        Bucket: S3_BUCKET,
        ContentType: mime,
        Key: id,
      })
      .promise();

    const photo = plainToClass(Photo, {
      height: image.bitmap.height,
      id,
      type,
      width: image.bitmap.width,
    });

    // catch future errors to remove uploaded file
    try {
      return await Photo.repository().save(photo);
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

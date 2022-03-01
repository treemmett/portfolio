import { createReadStream } from 'fs';
import { Credentials, Endpoint, S3 } from 'aws-sdk';
import { plainToClass } from 'class-transformer';
import Jimp from 'jimp';
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
import { PhotoType } from './PhotoType';
import { Post } from './Post';

const { S3_BUCKET, S3_KEY, S3_KEY_SECRET, S3_URL } = process.env;
const TABLE_NAME = 'photos';

@Entity({ name: TABLE_NAME })
export class Photo {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @CreateDateColumn()
  public created: Date;

  @ManyToOne(() => Post, (p) => p.photos)
  public post: Post;

  @Column({ nullable: false })
  public height: number;

  @Column({ enum: PhotoType, type: 'enum' })
  public type: PhotoType;

  @UpdateDateColumn()
  public updated: Date;

  public url: string;

  @Column({ nullable: false })
  public width: number;

  @AfterLoad()
  @AfterInsert()
  public afterLoad() {
    this.url = `${process.env.CDN_URL}/${this.id}`;
  }

  public static repository() {
    return getRepository<Photo>(TABLE_NAME);
  }

  public static async getAll(): Promise<Photo[]> {
    return Photo.repository().find();
  }

  public static async upload(
    filePath: string,
    type: PhotoType = PhotoType.ORIGINAL
  ): Promise<Photo> {
    if (!filePath) throw new Error('No photo to process');

    const image: Jimp = await new Promise((res, rej) => {
      Jimp.read(filePath, (err, img) => {
        if (err) {
          rej(err);
        } else {
          res(img);
        }
      });
    });

    const id = v4();

    const space = new S3({
      credentials: new Credentials({
        accessKeyId: S3_KEY,
        secretAccessKey: S3_KEY_SECRET,
      }),
      endpoint: new Endpoint(S3_URL),
    });

    await space
      .upload({
        ACL: 'public-read',
        Body: createReadStream(filePath),
        Bucket: S3_BUCKET,
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

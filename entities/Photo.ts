import { createReadStream } from 'fs';
import { Credentials, Endpoint, S3 } from 'aws-sdk';
import { plainToClass } from 'class-transformer';
import Jimp from 'jimp';
import {
  Column,
  CreateDateColumn,
  Entity,
  getRepository,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 } from 'uuid';
import { Post } from './Post';

const { S3_BUCKET, S3_KEY, S3_KEY_SECRET, S3_URL } = process.env;
const TABLE_NAME = 'photos';

export enum PhotoType {
  BLURRED,
  ORIGINAL,
  SCALED,
}

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

  public static repository() {
    return getRepository<Photo>(TABLE_NAME);
  }

  public static async getAll(): Promise<Photo[]> {
    const photos = await Photo.repository().find();
    return photos.map((p) => ({ ...p, url: `${process.env.CDN_URL}/${p.id}` }));
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
      url: `${process.env.CDN_URL}/${id}`,
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

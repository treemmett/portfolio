import { plainToClass } from 'class-transformer';
import { Sharp } from 'sharp';
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
import { s3 } from '../utils/s3';
import { PhotoType } from './PhotoType';
import { Post } from './Post';

const { CDN_URL, S3_BUCKET, S3_URL } = Config;

@Entity({ name: 'photos' })
export class Photo extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @CreateDateColumn()
  public created: Date;

  @ManyToOne(() => Post, (p) => p.photos)
  public post: Post;

  @Column({ nullable: false })
  public height: number;

  /**
   * base64 data uri of the scaled down thumbnail
   */
  @Column()
  public thumbnailURL: string;

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
      await s3
        .deleteObject({
          Bucket: S3_BUCKET,
          Key: id,
        })
        .promise();

      throw err;
    }
  }
}

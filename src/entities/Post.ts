import { readFile } from 'fs/promises';
import { plainToClass } from 'class-transformer';
import sharp from 'sharp';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { APIError, ErrorCode } from '../utils/errors';
import { Photo } from './Photo';
import { PhotoType } from './PhotoType';

@Entity({ name: 'posts' })
export class Post extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @CreateDateColumn()
  public created: Date;

  @UpdateDateColumn()
  public updated: Date;

  @OneToMany(() => Photo, (p) => p.post)
  public photos: Photo[];

  @Column({ type: 'smallint' })
  public red: number;

  @Column({ type: 'smallint' })
  public green: number;

  @Column({ type: 'smallint' })
  public blue: number;

  public static async upload(filePath: string): Promise<Post> {
    if (!filePath) {
      throw new APIError(ErrorCode.no_file_received, 400, 'No file uploaded');
    }

    const imageBuffer = await readFile(filePath);
    if (!imageBuffer.length) {
      throw new APIError(ErrorCode.no_file_received, 400, 'No file uploaded');
    }

    const image = sharp(imageBuffer);

    const tasks: Promise<Photo>[] = [Photo.upload(image, PhotoType.ORIGINAL)];

    // scale and blur images to the given dimensions
    [1000].map(async (size) => {
      const scaledImage = image.clone();
      scaledImage.resize(size, size, { fit: 'inside' });
      tasks.push(Photo.upload(scaledImage, PhotoType.SCALED));

      const blurredImage = scaledImage.clone();
      blurredImage.blur();
      tasks.push(Photo.upload(blurredImage, PhotoType.BLURRED));
    });

    const photos = await Promise.all(tasks);

    // get average color
    const { channels } = await image.stats();
    const [r, g, b] = channels.map((c) => Math.floor(c.mean));

    const post = plainToClass(Post, { blue: b, green: g, photos, red: r });

    return post.save();
  }
}

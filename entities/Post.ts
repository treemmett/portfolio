import { tmpdir } from 'os';
import { join } from 'path';
import { plainToClass } from 'class-transformer';
import Jimp from 'jimp';
import { Entity, getRepository, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { v4 } from 'uuid';
import { Photo, PhotoType } from './Photo';

const TABLE_NAME = 'posts';

@Entity({ name: TABLE_NAME })
export class Post {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @OneToMany(() => Photo, (p) => p.post)
  public photos: Photo[];

  public static repository() {
    return getRepository<Post>(TABLE_NAME);
  }

  public static async upload(filePath: string): Promise<Post> {
    const image: Jimp = await new Promise((res, rej) => {
      Jimp.read(filePath, (err, img) => {
        if (err) {
          rej(err);
        } else {
          res(img);
        }
      });
    });

    const photos = await Promise.all(
      [
        { type: PhotoType.ORIGINAL },
        { size: 1000, type: PhotoType.SCALED },
        { size: 500, type: PhotoType.SCALED },
        { size: 1000, type: PhotoType.BLURRED },
        { size: 500, type: PhotoType.BLURRED },
      ].map(async ({ type, size }) => {
        const img = image.clone();

        if (type !== PhotoType.ORIGINAL) {
          img.scaleToFit(size, size);

          if (type === PhotoType.BLURRED) {
            img.blur(15);
          }
        }

        const path = join(tmpdir(), v4());
        await img.writeAsync(path);
        return Photo.upload(path, type);
      })
    );

    const post = plainToClass(Post, { photos });

    await Post.repository().save(post);
    return post;
  }
}

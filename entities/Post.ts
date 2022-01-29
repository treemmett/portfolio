import { tmpdir } from 'os';
import { join } from 'path';
import { plainToClass } from 'class-transformer';
import Jimp from 'jimp';
import { Entity, getRepository, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { v4 } from 'uuid';
import { Photo } from './Photo';

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
    const path = join(tmpdir(), v4());

    const image: Jimp = await new Promise((res, rej) => {
      Jimp.read(filePath, (err, img) => {
        if (err) {
          rej(err);
        } else {
          res(img);
        }
      });
    });

    await Promise.all([
      image.clone().scaleToFit(1000, 1000).writeAsync(`${path}_1000`),
      image.clone().scaleToFit(500, 500).writeAsync(`${path}_500`),
      image.clone().scaleToFit(1000, 1000).blur(15).writeAsync(`${path}_b_1000`),
      image.clone().scaleToFit(500, 500).blur(15).writeAsync(`${path}_b_500`),
    ]);

    const post = plainToClass(Post, {
      photos: await Promise.all(
        [filePath, `${path}_1000`, `${path}_500`, `${path}_b_1000`, `${path}_b_500`].map((p) =>
          Photo.upload(p)
        )
      ),
    });

    await Post.repository().save(post);
    return post;
  }
}

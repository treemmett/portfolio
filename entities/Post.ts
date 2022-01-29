import { plainToClass } from 'class-transformer';
import { Entity, getRepository, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
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
    const photo = await Photo.upload(filePath);
    const post = plainToClass(Post, { photos: [photo] });
    await Post.repository().save(post);
    return post;
  }
}

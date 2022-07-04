import { plainToClass } from 'class-transformer';
import Jimp from 'jimp';
import { Field, ID, Int, ObjectType } from 'type-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  getRepository,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Photo } from './Photo';
import { PhotoType } from './PhotoType';

const TABLE_NAME = 'posts';

@Entity({ name: TABLE_NAME })
@ObjectType()
export class Post {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID)
  public id: string;

  @CreateDateColumn()
  @Field()
  public created: Date;

  @UpdateDateColumn()
  @Field()
  public updated: Date;

  @OneToMany(() => Photo, (p) => p.post)
  @Field(() => [Photo])
  public photos: Photo[];

  @Column({ type: 'smallint' })
  @Field(() => Int)
  public red: number;

  @Column({ type: 'smallint' })
  @Field(() => Int)
  public green: number;

  @Field(() => Int)
  @Column({ type: 'smallint' })
  public blue: number;

  public static repository() {
    return getRepository<Post>(TABLE_NAME);
  }

  public static async getAll() {
    return getRepository<Post>(TABLE_NAME)
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.photos', 'photo')
      .where('photo.type != :type', { type: PhotoType.ORIGINAL })
      .getMany();
  }

  public static async upload(filePath: string): Promise<Post> {
    const image = await Jimp.read(filePath);

    const tasks: Promise<Photo>[] = [Photo.upload(image, PhotoType.ORIGINAL)];

    // scale and blur images to the given dimensions
    [1000].map(async (size) => {
      const scaledImage = image.clone();
      scaledImage.scaleToFit(size, size);
      tasks.push(Photo.upload(scaledImage, PhotoType.SCALED));

      const blurredImage = scaledImage.clone();
      blurredImage.blur(15);
      tasks.push(Photo.upload(blurredImage, PhotoType.BLURRED));
    });

    const photos = await Promise.all(tasks);

    // get average color
    const { r, g, b } = Jimp.intToRGBA(
      image
        .clone()
        .blur(100)
        .getPixelColor(image.bitmap.width / 2, image.bitmap.height / 2)
    );

    const post = plainToClass(Post, { blue: b, green: g, photos, red: r });

    await Post.repository().save(post);
    return post;
  }

  public static async get(id: string): Promise<Post> {
    return getRepository<Post>(TABLE_NAME)
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.photos', 'photo')
      .where('photo.type != :type', { type: PhotoType.ORIGINAL })
      .andWhere('post.id = :id', { id })
      .getOne();
  }

  public async delete(): Promise<void> {
    await getRepository<Post>(TABLE_NAME).delete(this);
  }
}

import { tmpdir } from 'os';
import { join } from 'path';
import { plainToClass } from 'class-transformer';
import Jimp from 'jimp';
import { Field, ID, Int, ObjectType, Query, Resolver } from 'type-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  getRepository,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 } from 'uuid';
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
}

@Resolver(Post)
export class PostResolver {
  @Query(() => [Post])
  posts() {
    return Post.getAll();
  }
}

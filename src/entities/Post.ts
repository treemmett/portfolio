import { Type } from 'class-transformer';
import { transformAndValidate } from 'class-transformer-validator';
import { IsDate, IsOptional, IsString, IsUUID, Length, ValidateNested } from 'class-validator';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v4 } from 'uuid';
import { Photo, IPhoto } from './Photo';
import { User } from './User';
import { PostNotFoundError } from '@utils/errors';
import { logger } from '@utils/logger';

@Entity({ name: 'posts' })
export class Post extends BaseEntity {
  @IsString()
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  public id: string;

  @Type(() => User)
  @ValidateNested()
  @ManyToOne('users', { nullable: false })
  public owner: User;

  @IsDate()
  @Type(() => Date)
  @CreateDateColumn()
  public created: string;

  @Length(0, 200)
  @IsString()
  @IsOptional()
  @Column({ nullable: true, type: 'varchar' })
  public location?: string | null;

  @IsDate()
  @Type(() => Date)
  @UpdateDateColumn()
  public updated: Date;

  @Type(() => Photo)
  @ValidateNested()
  @OneToOne('photos')
  @JoinColumn()
  public photo: Photo;

  @Length(0, 200)
  @IsString()
  @IsOptional()
  @Column({ nullable: true, type: 'varchar' })
  public title?: string | null;

  public static async processUpload(token: string, user: User): Promise<Post> {
    logger.info('Processing upload');

    const { photo } = await Photo.processUpload(user, token);

    const id = v4();

    const post = await transformAndValidate(
      Post,
      {
        created: new Date(),
        id,
        owner: user,
        photo,
        updated: new Date(),
      },
      { validator: { forbidUnknownValues: true } }
    ).catch((err) => {
      logger.error(err, 'Post failed validation');
      throw err;
    });
    logger.info('Post passed validation');

    await post.save();

    logger.info('Post added to index');

    return post;
  }

  public static async getById(id: string): Promise<Post> {
    const post = await Post.findOneOrFail({ relations: { photo: true }, where: { id } });
    return transformAndValidate(Post, post);
  }

  public static async getAll(): Promise<Post[]> {
    const posts = await Post.find({
      relations: {
        owner: true,
        photo: true,
      },
    });

    return transformAndValidate(Post, posts);
  }

  public static async getOneFromUser(user: User, id: string): Promise<Post> {
    const post = await Post.createQueryBuilder('post')
      .select()
      .leftJoinAndSelect('post.photo', 'photo')
      .leftJoinAndSelect('post.owner', 'user')
      .where('user.username = :username', { username: user.username })
      .andWhere('post.id = :id', { id })
      .getOne();

    if (!post) {
      throw new PostNotFoundError();
    }

    return transformAndValidate(Post, post);
  }

  public static async getAllFromUser(username: string): Promise<Post[]> {
    const posts = await Post.createQueryBuilder('post')
      .select()
      .leftJoinAndSelect('post.photo', 'photo')
      .leftJoinAndSelect('post.owner', 'user')
      .where('user.username = :username', { username })
      .getMany();

    return transformAndValidate(Post, posts);
  }
}

export interface IPost
  extends Omit<
    Post,
    keyof BaseEntity | 'photo' | 'processUpload' | 'requestUploadToken' | 'getProcessingKey'
  > {
  photo: IPhoto;
}

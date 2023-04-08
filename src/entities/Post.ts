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
import { geocode } from '@lib/geocode';
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
  public created: Date;

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
  @OneToOne('photos', { onDelete: 'CASCADE' })
  @JoinColumn()
  public photo: Photo;

  @Length(0, 200)
  @IsString()
  @IsOptional()
  @Column({ nullable: true, type: 'varchar' })
  public title?: string | null;

  public static async processUpload(token: string, user: User): Promise<Post> {
    logger.info('Processing upload');

    const { photo, exifData } = await Photo.processUpload(user, token, true);

    const id = v4();

    const postData: IPost = {
      created: exifData.DateTimeOriginal || new Date(),
      id,
      owner: user,
      photo,
      updated: new Date(),
    };

    if (typeof exifData.latitude === 'number' && typeof exifData.longitude === 'number') {
      const geoData = await geocode(exifData.longitude, exifData.latitude);

      if (geoData.city) {
        if (geoData.country) {
          postData.location = `${geoData.city}, ${geoData.country}`;
        } else {
          postData.location = geoData.city;
        }
      } else if (geoData.county) {
        if (geoData.country) {
          postData.location = `${geoData.county}, ${geoData.country}`;
        } else {
          postData.location = geoData.county;
        }
      } else if (geoData.country) {
        postData.location = geoData.country;
      }
    }

    const post = await transformAndValidate(Post, postData, {
      validator: { forbidUnknownValues: true },
    }).catch((err) => {
      logger.error(err, 'Post failed validation');
      throw err;
    });
    logger.info('Post passed validation');

    await post.save();

    logger.info('Post added to index');

    return post;
  }

  public static async getOneFromUser(user: User, id: string): Promise<Post> {
    const post = await Post.createQueryBuilder('post')
      .select()
      .leftJoinAndSelect('post.photo', 'photo')
      .leftJoinAndSelect('post.owner', 'user')
      .leftJoin('photo.owner', 'photo_owner')
      .where('user.username = :username', { username: user.username })
      .andWhere('photo_owner.username = :username', { username: user.username })
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
      .leftJoin('photo.owner', 'photo_owner')
      .where('user.username = :username', { username })
      .andWhere('photo_owner.username = :username', { username })
      .orderBy('post.created', 'DESC')
      .getMany();

    return transformAndValidate(Post, posts);
  }

  public async delete() {
    await this.photo.delete();
    await this.remove();
  }
}

export interface IPost
  extends Omit<
    Post,
    keyof BaseEntity | 'photo' | 'processUpload' | 'getOneFromUser' | 'getAllFromUser' | 'delete'
  > {
  photo: IPhoto;
}

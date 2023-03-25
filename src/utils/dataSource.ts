import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Photo } from '@entities/Photo';
import { Post } from '@entities/Post';
import { Site } from '@entities/Site';
import { Config } from '@utils/config';
import { site1679621988878 } from 'src/migrations/1679621988878-site';
import { photo1679688008947 } from 'src/migrations/1679688008947-photo';
import { post1679706585667 } from 'src/migrations/1679706585667-foo';

export const AppDataSource = new DataSource({
  database: Config.DB_DATABASE,
  entities: [Post, Photo, Site],
  host: Config.DB_HOST,
  migrations: [site1679621988878, photo1679688008947, post1679706585667],
  password: Config.DB_PASSWORD,
  port: Config.DB_PORT,
  ssl: !!Config.DB_CERTIFICATE && {
    ca: Config.DB_CERTIFICATE,
  },
  subscribers: [],
  synchronize: false, // !Config.DB_CERTIFICATE,
  type: 'postgres',
  username: Config.DB_USERNAME,
});

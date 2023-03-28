import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Photo } from '@entities/Photo';
import { Post } from '@entities/Post';
import { Site } from '@entities/Site';
import { User } from '@entities/User';
import { Config } from '@utils/config';
import { site1679621988878 } from 'src/migrations/1679621988878-site';
import { photo1679688008947 } from 'src/migrations/1679688008947-photo';
import { post1679706585667 } from 'src/migrations/1679706585667-posts';
import { user1679760880585 } from 'src/migrations/1679760880585-user';
import { owner1679762581596 } from 'src/migrations/1679762581596-owner';
import { multiplePosts1679767977154 } from 'src/migrations/1679767977154-multiplePosts';
import { username1679784893697 } from 'src/migrations/1679784893697-username';
import { domain1679867824621 } from 'src/migrations/1679867824621-domain';
import { siteLogo1680006548188 } from 'src/migrations/1680006548188-siteLogo';
import { removeRGB1680010701198 } from 'src/migrations/1680010701198-removeRGB';
import { favicons1680012322782 } from 'src/migrations/1680012322782-favicons';
import { postPhotoCascade1680020863290 } from 'src/migrations/1680020863290-postPhotoCascade postPhotoCascade';
import { siteLogoCascade1680021401636 } from 'src/migrations/1680021401636-siteLogoCascade';
import { watermark1680031902838 } from 'src/migrations/1680031902838-watermark';

export const AppDataSource = new DataSource({
  database: Config.DB_DATABASE,
  entities: [Post, Photo, Site, User],
  host: Config.DB_HOST,
  migrations: [
    site1679621988878,
    photo1679688008947,
    post1679706585667,
    user1679760880585,
    owner1679762581596,
    multiplePosts1679767977154,
    username1679784893697,
    domain1679867824621,
    siteLogo1680006548188,
    removeRGB1680010701198,
    favicons1680012322782,
    postPhotoCascade1680020863290,
    siteLogoCascade1680021401636,
    watermark1680031902838,
  ],
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

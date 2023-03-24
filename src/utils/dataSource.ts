import { DataSource } from 'typeorm';
import { Site } from '@entities/Site';
import { Config } from '@utils/config';
import { site1679621988878 } from 'src/migrations/1679621988878-site';

export const AppDataSource = new DataSource({
  database: Config.DB_DATABASE,
  entities: [Site],
  host: Config.DB_HOST,
  migrations: [site1679621988878],
  password: Config.DB_PASSWORD,
  port: Config.DB_PORT,
  ssl: !!Config.DB_CERTIFICATE && {
    ca: Config.DB_CERTIFICATE,
  },
  subscribers: [],
  synchronize: !Config.DB_CERTIFICATE,
  type: 'postgres',
  username: Config.DB_USERNAME,
});

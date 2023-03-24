import { DataSource } from 'typeorm';
import { Site } from '@entities/Site';
import { Config } from '@utils/config';

export const AppDataSource = new DataSource({
  database: Config.DB_DATABASE,
  entities: [Site],
  host: Config.DB_HOST,
  migrations: [],
  password: Config.DB_PASSWORD,
  port: Config.DB_PORT,
  ssl: !!Config.DB_CERTIFICATE && {
    ca: Config.DB_CERTIFICATE,
  },
  subscribers: [],
  synchronize: true,
  type: 'postgres',
  username: Config.DB_USERNAME,
});

export default AppDataSource;

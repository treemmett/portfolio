import { DataSource } from 'typeorm';
import type { ApiMiddleware } from './nextConnect';
import { Site } from '@entities/Site';
import { Config } from '@utils/config';

export const AppDataSource = new DataSource({
  database: Config.DB_DATABASE,
  entities: [Site],
  host: Config.DB_HOST,
  migrations: [],
  password: Config.DB_PASSWORD,
  port: Config.DB_PORT,
  subscribers: [],
  synchronize: true,
  type: 'postgres',
  username: Config.DB_USERNAME,
});

AppDataSource.initialize();

export const connectToDatabase = async () => {
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }
};

export const connectToDatabaseMiddleware: ApiMiddleware = async (req, res, next) => {
  await connectToDatabase();
  next();
};

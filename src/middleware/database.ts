import { ApiMiddleware } from './nextConnect';
import { AppDataSource } from '@utils/dataSource';

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

export default AppDataSource;

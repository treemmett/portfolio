import 'dotenv/config';
import 'reflect-metadata';
import 'tsconfig-paths/register';

import { AppDataSource } from '@utils/dataSource';

AppDataSource.initialize()
  .then((source) => source.runMigrations())
  .then(() => AppDataSource.destroy());
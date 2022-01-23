import { createConnection, getConnectionManager } from 'typeorm';
import { Photo } from '../entities/Photo';

/**
 * Get existing database connection, or open a new connection if closed
 * @param name Defaults to 'default'
 * @returns typeorm.Connection
 */
export async function connectToDB(name = 'default'): Promise<void> {
  const {
    DB_DATABASE = 'blog',
    DB_HOST = 'localhost',
    DB_PASS,
    DB_PORT = '5432',
    DB_USER,
  } = process.env;

  if (getConnectionManager().has(name)) {
    const conn = getConnectionManager().get(name);
    if (!conn.isConnected) {
      await conn.connect();
    }

    return;
  }

  await createConnection({
    database: DB_DATABASE,
    entities: [Photo],
    host: DB_HOST,
    name,
    password: DB_PASS,
    port: parseInt(DB_PORT, 10),
    synchronize: true,
    type: 'postgres',
    username: DB_USER,
  });
}

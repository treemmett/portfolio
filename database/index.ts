import { Connection, getConnectionManager } from 'typeorm';
import { Photo } from '../entities/Photo';

/**
 * Get existing database connection, or open a new connection if closed
 * @param name Defaults to 'default'
 * @returns typeorm.Connection
 */
export async function connectToDB(name = 'default'): Promise<Connection> {
  const manager = getConnectionManager();

  if (manager.has(name)) {
    const conn = manager.get(name);
    if (!conn.isConnected) {
      return conn.connect();
    }
    return conn;
  }

  const {
    DB_DATABASE = 'blog',
    DB_HOST = 'localhost',
    DB_PASS,
    DB_PORT = '5432',
    DB_USER,
  } = process.env;

  const connection = manager.create({
    database: DB_DATABASE,
    entities: [Photo],
    host: DB_HOST,
    name,
    password: DB_PASS,
    port: parseInt(DB_PORT, 10),
    type: 'postgres',
    synchronize: true,
    username: DB_USER,
  });

  return connection.connect();
}

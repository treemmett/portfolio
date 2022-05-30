import { Connection, createConnection, getConnectionManager } from 'typeorm';
import { Photo } from '../entities/Photo';
import { Post } from '../entities/Post';

export interface DatabaseOptions {
  drop?: boolean;
  name?: string;
  synchronize?: boolean;
  test?: boolean;
}

/**
 * Get existing database connection, or open a new connection if closed
 * @param name Defaults to 'default'
 * @returns typeorm.Connection
 */
export async function connectToDB({
  drop = false,
  name = 'default',
  synchronize = true,
  test = false,
}: DatabaseOptions = {}): Promise<Connection> {
  const {
    DB_DATABASE = 'blog',
    DB_HOST = 'localhost',
    DB_PASS,
    DB_PORT = '5432',
    DB_USER,
  } = process.env;

  const conn = getConnectionManager().has(name)
    ? getConnectionManager().get(name)
    : await createConnection({
        database: test ? `${DB_DATABASE}_TEST` : DB_DATABASE,
        dropSchema: drop,
        entities: [Photo, Post],
        host: DB_HOST,
        name,
        password: DB_PASS,
        port: parseInt(DB_PORT, 10),
        synchronize,
        type: 'postgres',
        username: DB_USER,
      });

  if (!conn.isConnected) {
    await conn.connect();
  }

  return conn;
}

import { Connection, ConnectionOptions, EntitySchema, getConnectionManager } from 'typeorm';
import { Photo } from '../entities/Photo';
import { Post } from '../entities/Post';
import { Config } from '../utils/config';

function entitiesChanged(
  // eslint-disable-next-line @typescript-eslint/ban-types
  prevEntities: (string | Function | EntitySchema<unknown>)[],
  // eslint-disable-next-line @typescript-eslint/ban-types
  newEntities: (string | Function | EntitySchema<unknown>)[]
): boolean {
  if (prevEntities.length !== newEntities.length) return true;

  for (let i = 0; i < prevEntities.length; i += 1) {
    if (prevEntities[i] !== newEntities[i]) return true;
  }

  return false;
}

async function updateConnectionEntities(
  connection: Connection,
  // eslint-disable-next-line @typescript-eslint/ban-types
  entities: (string | Function | EntitySchema<unknown>)[]
) {
  if (!entitiesChanged(connection.options.entities, entities)) return;

  // @ts-expect-error entities is readonly
  // eslint-disable-next-line no-param-reassign
  connection.options.entities = entities;

  // @ts-expect-error protected method, but i don't give a fuck
  // cspell:disable-next
  connection.buildMetadatas();

  if (connection.options.synchronize) {
    await connection.synchronize();
  }
}

export interface DatabaseOptions {
  drop?: boolean;
  name?: string;
  synchronize?: boolean;
  test?: boolean;
}

const { DB_CERT, DB_DATABASE, DB_HOST, DB_PASS, DB_PORT, DB_USER } = Config;

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
  const options: ConnectionOptions = {
    database: test ? `${DB_DATABASE}_TEST` : DB_DATABASE,
    dropSchema: drop,
    entities: [Photo, Post],
    host: DB_HOST,
    password: DB_PASS,
    port: parseInt(DB_PORT, 10),
    ssl: DB_CERT ? { ca: DB_CERT.replaceAll('\\n', '\n') } : undefined,
    synchronize,
    type: 'postgres',
    username: DB_USER,
  };

  const connectionManager = getConnectionManager();

  if (connectionManager.has(name)) {
    const connection = connectionManager.get(name);

    if (!connection.isConnected) {
      await connection.connect();
    }

    if (process.env.NODE_ENV !== 'production') {
      await updateConnectionEntities(connection, options.entities);
    }

    return connection;
  }

  return connectionManager.create({ name, ...options }).connect();
}

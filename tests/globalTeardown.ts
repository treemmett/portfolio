import { connectToDB } from '../src/middleware/database';

export default async function globalTeardown() {
  const conn = await connectToDB({ synchronize: false, test: true });
  await conn.dropDatabase();
  await conn.close();
}

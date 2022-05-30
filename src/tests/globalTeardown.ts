import { connectToDB } from '../middleware/database';

export default async function globalTeardown() {
  const conn = await connectToDB({ synchronize: false, test: true });
  await conn.dropDatabase();
  await conn.close();
}

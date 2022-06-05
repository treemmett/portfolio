import { connectToDB } from '../src/middleware/database';

export default async function globalSetup() {
  await connectToDB({
    drop: true,
    synchronize: true,
    test: true,
  });
}

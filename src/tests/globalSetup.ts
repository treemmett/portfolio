import { connectToDB } from '../middleware/database';

export default async function globalSetup() {
  await connectToDB({
    drop: true,
    synchronize: true,
    test: true,
  });
}

import { Connection } from 'typeorm';
import { connectToDB } from '../middleware/database';

let conn: Connection;

beforeAll(async () => {
  conn = await connectToDB({ synchronize: false, test: true });
});

afterAll(async () => {
  await conn.close();
});

jest.mock('aws-sdk', () => ({
  Credentials: jest.fn(),
  Endpoint: jest.fn(),
  S3: jest.fn(() => ({
    deleteObject: jest.fn().mockReturnThis(),
    promise: jest.fn(),
    upload: jest.fn().mockReturnThis(),
  })),
}));

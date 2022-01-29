import { resolve } from 'path';
import { Connection } from 'typeorm';
import { connectToDB } from '../middleware/database';
import { Photo } from './Photo';

jest.mock('aws-sdk', () => ({
  Credentials: jest.fn(),
  Endpoint: jest.fn(),
  S3: jest.fn(() => ({
    deleteObject: jest.fn().mockReturnThis(),
    promise: jest.fn(),
    upload: jest.fn().mockReturnThis(),
  })),
}));

let conn: Connection;

const PHOTO_PATH = resolve(__dirname, '../tests/fixtures/358-1272x1193.jpg');

beforeAll(async () => {
  conn = await connectToDB(true);
});

afterAll(async () => {
  await conn.dropDatabase();
  await conn.close();
});

describe('photo uploads', () => {
  it('should require a file', async () => {
    expect(Photo.upload(null)).rejects.toThrow();
  });

  it('should parse and save a file', async () => {
    await expect(Photo.upload(PHOTO_PATH)).resolves.toBeInstanceOf(Photo);
  });

  it('should read the photo dimensions', async () => {
    const photo = await Photo.upload(PHOTO_PATH);
    expect(photo.width).toBe(1272);
    expect(photo.height).toBe(1193);
  });

  it('should generate an id', async () => {
    const photo = await Photo.upload(PHOTO_PATH);
    expect(photo.id).toBeDefined();
  });
});

describe('photo getters', () => {
  it('should return a list of photos', async () => {
    const photos = await Promise.all([Photo.upload(PHOTO_PATH), Photo.upload(PHOTO_PATH)]);
    const list = await Photo.getAll();

    list.forEach((p) => {
      expect(p).toBeInstanceOf(Photo);
    });
    expect(list.length).toBeGreaterThanOrEqual(2);
    expect(photos.map((p) => p.id)).toContain(photos[0].id);
    expect(photos.map((p) => p.id)).toContain(photos[1].id);
  });
});

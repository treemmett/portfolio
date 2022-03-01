import { PHOTO_PATH } from '../tests/fixtures';
import { Photo } from './Photo';
import { PhotoType } from './PhotoType';

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

describe('photo types', () => {
  it('should set the default photo type', async () => {
    const p = await Photo.upload(PHOTO_PATH);
    expect(p.type).toBe(PhotoType.ORIGINAL);
  });

  it('should set the original photo type', async () => {
    const p = await Photo.upload(PHOTO_PATH, PhotoType.ORIGINAL);
    expect(p.type).toBe(PhotoType.ORIGINAL);
  });

  it('should set the blurred photo type', async () => {
    const p = await Photo.upload(PHOTO_PATH, PhotoType.BLURRED);
    expect(p.type).toBe(PhotoType.BLURRED);
  });

  it('should set the scaled photo type', async () => {
    const p = await Photo.upload(PHOTO_PATH, PhotoType.SCALED);
    expect(p.type).toBe(PhotoType.SCALED);
  });
});

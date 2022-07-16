import { describe, expect } from '@jest/globals';
import sharp from 'sharp';
import { PHOTO_PATH } from '../../tests/fixtures';
import { Photo } from './Photo';
import { PhotoType } from './PhotoType';

describe('photo uploads', () => {
  it('should require a file', async () => {
    expect(Photo.upload(null)).rejects.toThrow();
  });

  it('should parse and save a file', async () => {
    await expect(Photo.upload(sharp(PHOTO_PATH))).resolves.toBeInstanceOf(Photo);
  });

  it('should read the photo dimensions', async () => {
    const photo = await Photo.upload(sharp(PHOTO_PATH));
    expect(photo.width).toBe(1272);
    expect(photo.height).toBe(1193);
  });

  it('should generate an id', async () => {
    const photo = await Photo.upload(sharp(PHOTO_PATH));
    expect(photo.id).toBeDefined();
  });
});

describe('photo types', () => {
  it('should set the default photo type', async () => {
    const p = await Photo.upload(sharp(PHOTO_PATH));
    expect(p.type).toBe(PhotoType.ORIGINAL);
  });

  it('should set the original photo type', async () => {
    const p = await Photo.upload(sharp(PHOTO_PATH), PhotoType.ORIGINAL);
    expect(p.type).toBe(PhotoType.ORIGINAL);
  });
});

import { describe, expect } from '@jest/globals';
import { PHOTO_PATH } from '../../tests/fixtures';
import { Photo } from './Photo';
import { PhotoType } from './PhotoType';
import { Post } from './Post';

describe('post uploading', () => {
  let post: Post;

  beforeAll(async () => {
    post = await Post.upload(PHOTO_PATH);
  });

  it('should upload a post', () => {
    expect(post).toBeInstanceOf(Post);
  });

  it('should include photos', () => {
    expect(post.photos[0]).toBeInstanceOf(Photo);
  });

  it('should upload the original photo', () => {
    expect(post.photos).toEqual(
      expect.arrayContaining([expect.objectContaining({ type: PhotoType.ORIGINAL })])
    );
    expect(post.photos.filter((p) => p.type === PhotoType.ORIGINAL)).toHaveLength(1);
  });
});

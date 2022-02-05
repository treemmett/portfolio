import { PHOTO_PATH } from '../tests/fixtures';
import { Photo } from './Photo';
import { Post } from './Post';

jest.setTimeout(10000);

it('should upload a post with images', async () => {
  const post = await Post.upload(PHOTO_PATH);
  expect(post).toBeInstanceOf(Post);
  expect(post.photos[0]).toBeInstanceOf(Photo);
});

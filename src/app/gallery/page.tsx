import { Gallery } from './Gallery';
import { getPosts } from '@lib/getPosts';

export default async function GalleryPage() {
  const posts = await getPosts();

  return <Gallery posts={posts} />;
}

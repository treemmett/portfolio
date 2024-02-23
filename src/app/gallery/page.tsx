import { Gallery } from './Gallery';
import { getPosts } from '@lib/getPosts';

export default async function GalleryPage() {
  const posts = await getPosts().then((p) => p.slice(0, 10));

  return <Gallery posts={posts} />;
}

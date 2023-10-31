import { notFound } from 'next/navigation';
import { getPosts } from './getPosts';

export async function getPost(id: string) {
  const posts = await getPosts();
  const post = posts.find((p) => p.id === id);

  if (!post) {
    notFound();
  }

  return post;
}

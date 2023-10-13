import { MetadataRoute } from 'next';
import { getPosts } from '@lib/getPosts';

export default async function Sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts();

  return [
    {
      changeFrequency: 'weekly',
      priority: 1,
      url: '/',
    },
    {
      changeFrequency: 'weekly',
      priority: 0.8,
      url: '/map',
    },
    {
      changeFrequency: 'monthly',
      priority: 0.7,
      url: '/resume',
    },
    ...posts.map((post) => ({
      lastModified: post.updated,
      priority: 0.5,
      url: `/${post.id}`,
    })),
  ];
}

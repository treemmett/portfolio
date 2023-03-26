import Head from 'next/head';
import { FC } from 'react';
import { usePosts } from '@lib/posts';
import { useSite } from '@lib/site';

export const Meta: FC = () => {
  const { site } = useSite();
  const { posts } = usePosts();

  if (!site) return null;

  const { title, description } = site;

  return (
    <Head>
      <title>{title}</title>
      <meta content={title} property="og:title" />
      <meta content={title} name="twitter:title" />
      {description && (
        <>
          <meta content={description} name="description" />
          <meta content={description} property="og:description" />
          <meta content={description} name="twitter:description" />
        </>
      )}
      {posts?.length && (
        <>
          <meta content={posts[0].photo.url} property="og:image" />
          <meta content={posts[0].photo.url} name="twitter:image" />
          <meta content={posts[0].photo.height.toString()} property="og:image:height" />
          <meta content={posts[0].photo.width.toString()} property="og:image:width" />
        </>
      )}
      <meta content="summary_large_image" name="twitter:card" />
    </Head>
  );
};

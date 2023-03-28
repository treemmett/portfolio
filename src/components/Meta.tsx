import Head from 'next/head';
import { FC, useMemo } from 'react';
import type { IPhoto } from '@entities/Photo';
import { usePosts } from '@lib/posts';
import { useSite } from '@lib/site';

export const Meta: FC = () => {
  const { site } = useSite();
  const { posts } = usePosts();

  const { title, description } = site || {};

  const largestFavicon = useMemo(
    () =>
      site?.favicons.reduce((acc, cur) => {
        if (!acc) return cur;

        if (acc.width < cur.width) return cur;

        return acc;
      }, null as IPhoto | null),
    [site?.favicons]
  );

  if (!site) return null;

  return (
    <Head>
      {title && (
        <>
          <title>{title}</title>
          <meta content={title} property="og:title" />
          <meta content={title} name="twitter:title" />
        </>
      )}
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
      {site.favicons?.length && (
        <>
          {largestFavicon && <link href={largestFavicon.url} rel="icon" />}
          {site.favicons.map((icon) => (
            <link
              href={icon.url}
              key={icon.id}
              rel="apple-touch-icon"
              sizes={`${icon.width}x${icon.height}`}
            />
          ))}
        </>
      )}
      <meta content="summary_large_image" name="twitter:card" />
    </Head>
  );
};

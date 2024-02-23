'use client';

import classNames from 'classnames';
import Image from 'next/image';
import { useCallback, useState } from 'react';
import { getPosts } from '@lib/getPosts';
import { Config } from '@utils/config';

export function Gallery({ posts }: { posts: Awaited<ReturnType<typeof getPosts>> }) {
  const [currentPost, setCurrentPost] = useState(0);

  const next = useCallback(() => {
    setCurrentPost(currentPost === posts.length - 1 ? 0 : currentPost + 1);
  }, [currentPost, posts.length]);

  const prev = useCallback(() => {
    setCurrentPost(currentPost === 0 ? posts.length - 1 : currentPost - 1);
  }, [currentPost, posts]);

  return (
    <div className="relative h-screen w-screen overflow-hidden shadow-xl">
      {posts.map((post, i) => {
        const url = Config.CDN_URL
          ? `${Config.CDN_URL}/${post.photo?.id}`
          : `${Config.S3_URL}/${Config.S3_BUCKET}/${post.photo?.id}`;

        const label = [post.title, post.location].filter((a) => !!a).join(', ');

        return (
          <div
            className={classNames(
              'absolute inline-block transform-gpu rounded-md bg-cover bg-center shadow-md transition-all',
              {
                '!left-0 top-0 h-full w-full transform-none': i <= currentPost,
                'top-1/2 h-96 w-[280px] -translate-y-1/2': i > currentPost,
              },
            )}
            key={post.id}
            style={{
              left: `calc(60% - 140px + ${
                ((i - currentPost) % posts.length) * (280 + 16 * 2.5)
              }px)`,
            }}
          >
            <h1>{label}</h1>
            <Image
              alt={label}
              blurDataURL={post.photo.thumbnailURL}
              className="absolute left-0 top-0 mb-4 block h-auto h-full w-full w-full select-none rounded-md object-cover"
              height={post.photo.height}
              placeholder="blur"
              priority={i < 2}
              src={url}
              width={post.photo.width}
            />
          </div>
        );
      })}

      <div className="absolute">
        <button onClick={prev}>Previous</button>

        <button onClick={next}>Next</button>
      </div>
    </div>
  );
}

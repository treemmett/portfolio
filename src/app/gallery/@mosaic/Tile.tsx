import { Photo, Post } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import { Config } from '@utils/config';

export interface TileProps {
  post: Post & { photo: Photo };
  priority?: boolean;
}

export const Tile: FC<TileProps> = ({ post, priority }) => {
  const label = [post.title, post.location, post.created.toISOString()]
    .filter((i) => !!i)
    .join(', ');

  const url = Config.CDN_URL
    ? `${Config.CDN_URL}/${post.photo?.id}`
    : `${Config.S3_URL}/${Config.S3_BUCKET}/${post.photo?.id}`;

  return (
    <Link aria-label={label} href={`/gallery/${post.id}`} scroll={false} passHref shallow>
      <Image
        alt={label}
        blurDataURL={post.photo.thumbnailURL}
        className="block w-full h-auto mb-4 select-none"
        height={post.photo.height}
        placeholder="blur"
        priority={priority}
        sizes={new Array(12)
          .fill(null)
          .map((_, i) => `(max-width: ${(i + 1) * 260}px) ${Math.floor(100 / (i + 1))}vw`)
          .join(', ')}
        src={url}
        width={post.photo.width}
      />
    </Link>
  );
};

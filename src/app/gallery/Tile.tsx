import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';

export interface TileProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post: any;
  priority?: boolean;
}

export const Tile: FC<TileProps> = ({ post, priority }) => {
  const label = [post.title, post.location, post.created.toISOString()]
    .filter((i) => !!i)
    .join(', ');

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
        src={post.photo.url}
        width={post.photo.width}
      />
    </Link>
  );
};

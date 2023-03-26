import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import styles from './Tile.module.scss';
import type { IPost } from '@entities/Post';
import { formatDate } from '@utils/date';

export interface TileProps {
  post: IPost;
}

export const Tile: FC<TileProps> = ({ post }) => {
  const label = [post.title, post.location, formatDate(post.created)].filter((i) => !!i).join(', ');

  return (
    <Link
      aria-label={label}
      href={`/u/${post.owner.username}/${post.id}`}
      scroll={false}
      passHref
      shallow
    >
      <Image
        alt={label}
        blurDataURL={post.photo.thumbnailURL}
        className={styles.tile}
        height={post.photo.height}
        placeholder="blur"
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

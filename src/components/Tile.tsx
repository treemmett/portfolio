import Image from 'next/image';
import { FC, useMemo } from 'react';
import styles from './Tile.module.scss';
import { PhotoType } from '@entities/PhotoType';
import { Post } from '@entities/Post';

export interface TileProps {
  post: Post;
}

export const Tile: FC<TileProps> = ({ post }) => {
  const image = useMemo(
    () => post.photos.find((p) => p.type === PhotoType.ORIGINAL),
    [post.photos]
  );

  return (
    <Image
      alt={post.title}
      blurDataURL={image.thumbnailURL}
      className={styles.tile}
      height={image.height}
      placeholder="blur"
      src={image.url}
      width={image.width}
    />
  );
};

import Image from 'next/image';
import { FC } from 'react';
import styles from './Post.module.scss';

export interface PostProps {
  height?: number;
  title?: string;
  text?: string;
  photo?: string;
  width?: number;
}

export const Post: FC<PostProps> = ({ height = 700, title = 'Portugal!', width = 1000 }) => (
  <div className={styles.post}>
    <Image
      alt={title}
      className={styles.photo}
      src={`https://picsum.photos/${width}/${height}`}
      width={width}
      height={height}
    />
    <div className={styles.content}>{title}</div>
  </div>
);

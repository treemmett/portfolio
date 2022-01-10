import Image from 'next/image';
import { FC, useMemo } from 'react';
import styles from './Post.module.scss';

export interface PostProps {
  title?: string;
  text?: string;
  photo?: string;
}

export const Post: FC<PostProps> = ({ title = 'Portugal!' }) => {
  const width = useMemo(() => Math.floor(Math.random() * 1000 + 400), []);
  const height = useMemo(() => Math.floor(Math.random() * 1000 + 400), []);

  return (
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
};

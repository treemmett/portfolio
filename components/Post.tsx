import { FC, useMemo } from 'react';
import styles from './Post.module.scss';

export interface PostProps {
  title?: string;
  text?: string;
  photo?: string;
}

export const Post: FC<PostProps> = ({ title = 'Portugal!' }) => {
  const width = useMemo(() => Math.floor(Math.random() * 1000 + 600), []);
  const height = useMemo(() => Math.floor(Math.random() * 1000 + 400), []);

  return (
    <div className={styles.post}>
      <img alt={title} className={styles.photo} src={`https://picsum.photos/${width}/${height}`} />
    </div>
  );
};

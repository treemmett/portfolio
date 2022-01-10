import { FC } from 'react';
import { Post } from './Post';
import styles from './Gallery.module.scss';

export const Gallery: FC = () => (
  <section className={styles.gallery}>
    {new Array(10).fill(null).map((_, i) => (
      // eslint-disable-next-line react/no-array-index-key
      <Post key={i} />
    ))}
  </section>
);

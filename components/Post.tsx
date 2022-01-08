import Image from 'next/image';
import { FC } from 'react';
import styles from './Post.module.scss';

export interface PostProps {
  title?: string;
  text?: string;
  photo?: string;
}

export const Post: FC<PostProps> = ({
  text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec et porttitor purus. Donec dapibus, felis vel dictum lobortis, felis augue lobortis nunc, ac rutrum sapien tellus in quam. Quisque pharetra iaculis tortor fringilla feugiat.',
  title = 'Portugal!',
}) => (
  <div className={styles.post}>
    <h2 className={styles.title}>{title}</h2>
    <div className={styles.text}>{text}</div>
    <Image
      alt={title}
      className={styles.photo}
      src="https://picsum.photos/200/300"
      width={300}
      height={200}
      layout="responsive"
    />
  </div>
);

import Image from 'next/image';
import { FC, useCallback, useRef } from 'react';
import styles from './Post.module.scss';

export interface PostProps {
  height?: number;
  title?: string;
  text?: string;
  photo?: string;
  width?: number;
}

export const Post: FC<PostProps> = ({
  height = 200,
  text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec et porttitor purus. Donec dapibus, felis vel dictum lobortis, felis augue lobortis nunc, ac rutrum sapien tellus in quam. Quisque pharetra iaculis tortor fringilla feugiat.',
  title = 'Portugal!',
  width = 400,
}) => {
  const ref = useRef<HTMLDivElement>();

  const listener = useCallback((e: MouseEvent) => {
    const { offsetLeft, offsetHeight, offsetTop, offsetWidth } = ref.current;
    const { pageX, pageY } = e;
    const rotateX = (((pageY - offsetTop) / offsetHeight) * 20 - 10).toFixed(2);
    const rotateY = (((pageX - offsetLeft) / offsetWidth) * 20 - 10).toFixed(2);
    ref.current.style.setProperty('transform', `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
  }, []);

  const startListener = useCallback(
    () => window.addEventListener('mousemove', listener),
    [listener]
  );
  const removeListener = useCallback(() => {
    window.removeEventListener('mousemove', listener);
    ref.current.style.removeProperty('transform');
  }, [listener]);

  return (
    <div
      className={styles.post}
      onMouseEnter={startListener}
      onMouseLeave={removeListener}
      ref={ref}
    >
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.text}>{text}</div>
      <Image
        alt={title}
        className={styles.photo}
        src={`https://picsum.photos/${width}/${height}`}
        width={width}
        height={height}
        layout="responsive"
      />
    </div>
  );
};

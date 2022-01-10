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

const TRANSFORM_SCALE = 20;

function getRotation(mousePosition: number, elementStart: number, elementWidth: number): string {
  const product =
    ((mousePosition - elementStart) / elementWidth) * TRANSFORM_SCALE - TRANSFORM_SCALE / 2;

  return (product * -1).toFixed(2);
}

export const Post: FC<PostProps> = ({ height = 700, title = 'Portugal!', width = 1000 }) => {
  const ref = useRef<HTMLDivElement>();

  const listener = useCallback((e: MouseEvent) => {
    const { offsetLeft, offsetHeight, offsetTop, offsetWidth } = ref.current;
    const { pageX, pageY } = e;
    const rotateX = getRotation(pageY, offsetTop, offsetHeight);
    const rotateY = getRotation(pageX, offsetLeft, offsetWidth);

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

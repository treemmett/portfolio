import { FC, useCallback, useEffect, useState } from 'react';
import { getRemValue, toPx } from '../utils/pixels';
import styles from './Post.module.scss';

export interface PostProps {
  title?: string;
  text?: string;
  photo?: string;
}

const MAX_HEIGHT = 40 * getRemValue();
const HEIGHT = 0.6;

export const Post: FC<PostProps> = ({ title = 'Portugal!' }) => {
  const [actualHeight, setActualHeight] = useState(0);
  const [actualWidth, setActualWidth] = useState(0);

  useEffect(() => {
    setActualHeight(Math.floor(Math.random() * 1000 + 600));
    setActualWidth(Math.floor(Math.random() * 1000 + 400));
  }, []);

  const [height, setHeight] = useState(toPx(HEIGHT));
  const [width, setWidth] = useState(toPx(actualWidth));

  const scaleImage = useCallback(() => {
    const scaled = window.innerHeight * HEIGHT;
    const h = scaled > MAX_HEIGHT ? MAX_HEIGHT : scaled;
    setWidth(toPx((h * actualWidth) / actualHeight));
    setHeight(toPx(h));
  }, [actualWidth, actualHeight]);

  useEffect(() => {
    window.addEventListener('resize', scaleImage);
    scaleImage();

    return () => window.removeEventListener('resize', scaleImage);
  }, [scaleImage]);

  return (
    <div className={styles.post}>
      <img
        alt={title}
        className={styles.photo}
        src={`https://picsum.photos/${actualWidth}/${actualHeight}`}
        style={{ width, height }}
      />
    </div>
  );
};

import { FC, useCallback, useEffect, useState } from 'react';
import { getRemValue, toPx } from '../utils/pixels';
import styles from './Post.module.scss';

export interface PostProps {
  height: number;
  title: string;
  url: string;
  width: number;
}

const MAX_HEIGHT = 40 * getRemValue();
const HEIGHT = 0.6;

export const Post: FC<PostProps> = ({ height: actualHeight, title, url, width: actualWidth }) => {
  const [height, setHeight] = useState(toPx(0));
  const [width, setWidth] = useState(toPx(0));

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
      <img alt={title} className={styles.photo} src={url} style={{ height, width }} />
    </div>
  );
};

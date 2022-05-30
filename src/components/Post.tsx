import cx from 'classnames';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { PhotoType } from '../entities/PhotoType';
import type { Post as PostEntity } from '../entities/Post';
import { getRemValue, toPx } from '../utils/pixels';
import styles from './Post.module.scss';

export interface PostProps {
  post: PostEntity;
}

const MAX_HEIGHT = 40 * getRemValue();
const HEIGHT = 0.6;

export const Post: FC<PostProps> = ({ post }) => {
  const [height, setHeight] = useState(toPx(0));
  const [width, setWidth] = useState(toPx(0));

  const scaleImage = useCallback(() => {
    const scaled = window.innerHeight * HEIGHT;
    const h = scaled > MAX_HEIGHT ? MAX_HEIGHT : scaled;
    setWidth(toPx((h * post.photos[0].width) / post.photos[0].height));
    setHeight(toPx(h));
  }, [post]);

  useEffect(() => {
    window.addEventListener('resize', scaleImage);
    scaleImage();

    return () => window.removeEventListener('resize', scaleImage);
  }, [scaleImage]);

  const [shouldLoadBlur, setShouldLoadBlur] = useState(false);
  const [shouldLoadScaled, setShouldLoadScaled] = useState(false);
  useEffect(() => {
    setTimeout(() => setShouldLoadBlur(true), 1000);
  }, []);

  const blurredImages = useMemo(
    () => post.photos.filter((p) => p.type === PhotoType.BLURRED),
    [post]
  );
  const scaledImages = useMemo(
    () => post.photos.filter((p) => p.type === PhotoType.SCALED),
    [post]
  );

  return (
    <div className={styles.post} style={{ height, width }}>
      <div
        className={cx(styles.placeholder, styles.photo)}
        style={{ backgroundColor: `rgb(${post.red}, ${post.green}, ${post.blue})`, height, width }}
      />
      {shouldLoadBlur && (
        <img
          alt="My Post"
          className={styles.photo}
          onLoad={() => setTimeout(() => setShouldLoadScaled(true), 1000)}
          sizes={`(max-width: 600px) ${Math.min(...blurredImages.map((p) => p.width))}px, 800px`}
          srcSet={blurredImages.map((p) => `${p.url} ${p.width}w`).join(', ')}
          style={{ height, width }}
        />
      )}
      {shouldLoadScaled && (
        <img
          alt="My Post"
          className={styles.photo}
          sizes={`(max-width: 600px) ${Math.min(...scaledImages.map((p) => p.width))}px, 800px`}
          srcSet={scaledImages.map((p) => `${p.url} ${p.width}w`).join(', ')}
          style={{ height, width }}
        />
      )}
    </div>
  );
};

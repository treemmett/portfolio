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

enum LoadingStages {
  DEFAULT = 0,
  BLUR_LOADING = 1,
  BLUR_LOADED = 2,
}

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

  const [stage, setStage] = useState<LoadingStages>(LoadingStages.DEFAULT);
  const blurredImages = useMemo(
    () => post.photos.filter((p) => p.type === PhotoType.BLURRED),
    [post]
  );
  useEffect(() => {
    setTimeout(setStage, 1000, LoadingStages.BLUR_LOADING);
  }, []);

  return (
    <div className={styles.post} style={{ height, width }}>
      <div
        className={cx(styles.placeholder, styles.photo, {
          [styles.loaded]: stage >= LoadingStages.BLUR_LOADED,
        })}
        style={{ backgroundColor: `rgb(${post.red}, ${post.green}, ${post.blue})`, height, width }}
      />
      {stage >= LoadingStages.BLUR_LOADING && (
        <img
          alt="My Post"
          className={styles.photo}
          onLoad={() => setStage(LoadingStages.BLUR_LOADED)}
          sizes={`(max-width: 600px) ${Math.min(...blurredImages.map((p) => p.width))}px, 800px`}
          srcSet={blurredImages.map((p) => `${p.url} ${p.width}w`).join(', ')}
          style={{ height, width }}
        />
      )}
    </div>
  );
};

import { FC, useCallback, useEffect, useState } from 'react';
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

  const scaledImages = post.photos.filter((p) => p.type === PhotoType.SCALED);

  return (
    <div className={styles.post}>
      <img
        alt="My Post"
        className={styles.photo}
        sizes={`(max-width: 600px) ${Math.min(...scaledImages.map((p) => p.width))}px, 800px`}
        srcSet={scaledImages.map((p) => `${p.url} ${p.width}w`).join(', ')}
        style={{ height, width }}
      />
    </div>
  );
};

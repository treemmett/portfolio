import cx from 'classnames';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { PhotoType } from '../entities/PhotoType';
import type { Post as PostEntity } from '../entities/Post';
import { getRemValue, mdMin, scaleDimensions, toPx } from '../utils/pixels';
import styles from './Post.module.scss';

export interface PostProps {
  post: PostEntity;
}

const MAX_HEIGHT = 40 * getRemValue();
const HEIGHT = 0.6;

const MAX_WIDTH = 20 * getRemValue();
const WIDTH = 0.9;

export const Post: FC<PostProps> = ({ post }) => {
  const [height, setHeight] = useState(toPx(0));
  const [width, setWidth] = useState(toPx(0));

  const scaleImage = useCallback(() => {
    const isMobile = window.innerWidth <= mdMin;
    const [photo] = post.photos;

    if (isMobile) {
      const scaled = window.innerWidth * WIDTH;
      const [scaledW, scaledH] = scaleDimensions(photo.width, photo.height, {
        w: scaled > MAX_WIDTH ? MAX_WIDTH : scaled,
      });
      setWidth(toPx(scaledW));
      setHeight(toPx(scaledH));
    } else {
      const scaled = window.innerHeight * HEIGHT;
      const [scaledW, scaledH] = scaleDimensions(photo.width, photo.height, {
        h: scaled > MAX_HEIGHT ? MAX_HEIGHT : scaled,
      });
      setWidth(toPx(scaledW));
      setHeight(toPx(scaledH));
    }
  }, [post]);

  useEffect(() => {
    window.addEventListener('resize', scaleImage);
    scaleImage();

    return () => window.removeEventListener('resize', scaleImage);
  }, [scaleImage]);

  const [shouldLoadBlur, setShouldLoadBlur] = useState(false);
  const [shouldLoadScaled, setShouldLoadScaled] = useState(false);
  const [phaseBlur, setPhaseBlur] = useState(true);
  const [phaseScale, setPhaseScale] = useState(true);
  useEffect(() => {
    setTimeout(() => setShouldLoadBlur(true), 1000);
  }, []);

  /**
   * This effect adds the width/height transition after the post has been
   * rendered, preventing an animation on the initial load
   */
  const [unsetTransition, setUnsetTransition] = useState(true);
  useEffect(() => {
    setUnsetTransition([height, width].every((dimension) => dimension === '0px'));
  }, [height, width]);

  const blurredImages = useMemo(
    () => post.photos.filter((p) => p.type === PhotoType.BLURRED),
    [post]
  );
  const scaledImages = useMemo(
    () => post.photos.filter((p) => p.type === PhotoType.SCALED),
    [post]
  );

  return (
    <div className={styles.post} style={{ height, transition: unsetTransition && 'unset', width }}>
      <div
        className={cx(styles.placeholder, styles.photo)}
        style={{ backgroundColor: `rgb(${post.red}, ${post.green}, ${post.blue})` }}
      />
      {shouldLoadBlur && (
        <img
          alt="My Post"
          className={cx(styles.photo, { [styles.phase]: phaseBlur })}
          onLoad={() => {
            setPhaseBlur(false);
            setShouldLoadScaled(true);
          }}
          sizes={`(max-width: 600px) ${Math.min(...blurredImages.map((p) => p.width))}px, 800px`}
          srcSet={blurredImages.map((p) => `${p.url} ${p.width}w`).join(', ')}
        />
      )}
      {shouldLoadScaled && (
        <img
          alt="My Post"
          className={cx(styles.photo, { [styles.phase]: phaseScale })}
          onLoad={() => setPhaseScale(false)}
          sizes={`(max-width: 600px) ${Math.min(...scaledImages.map((p) => p.width))}px, 800px`}
          srcSet={scaledImages.map((p) => `${p.url} ${p.width}w`).join(', ')}
        />
      )}
    </div>
  );
};

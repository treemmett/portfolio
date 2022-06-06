import cx from 'classnames';
import { useRouter } from 'next/router';
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PhotoType } from '../entities/PhotoType';
import { scaleDimensions, toPx } from '../utils/pixels';
import { useDataStore } from './DataStore';
import styles from './LightBox.module.scss';

enum AnimationFrame {
  /** no photo is opened, and light box is off */
  off,
  /** photo is scaled to the gallery  */
  on_gallery,
  /** photo is transitioning to the light box */
  to_light_box,
  /** photo is on display in light box */
  on_light_box,
  /** photo is transitioning to the light box */
  to_gallery,
}

export const LightBox: FC = () => {
  const { query, push } = useRouter();
  const { lightBox, posts, setLightBox } = useDataStore();

  const photo = useMemo(
    () =>
      posts
        .find((p) => p.id === query.post)
        ?.photos.reduce((acc, cur) => {
          if (acc.type !== PhotoType.SCALED) return cur;
          return cur.type === PhotoType.SCALED && cur.width > acc.width ? cur : acc;
        }),
    [query.post, posts]
  );

  const galleryRef = useRef();
  const [frame, setFrame] = useState(AnimationFrame.off);
  const [width, setWidth] = useState<number>();
  const [height, setHeight] = useState<number>();
  const [top, setTop] = useState<number>();
  const [left, setLeft] = useState<number>();
  useEffect(() => {
    if (query.post) {
      setFrame(AnimationFrame.on_gallery);
    }

    if (!query.post) {
      setFrame(AnimationFrame.off);
    }
  }, [query.post]);

  const scaleImage = useCallback(() => {
    const [w, h] = scaleDimensions(
      photo.width,
      photo.height,
      { h: photo.height },
      galleryRef.current
    );
    setWidth(w);
    setHeight(h);
    setLeft(window.innerWidth / 2 - width / 2);
    setTop(window.innerHeight / 2 - height / 2);
  }, [photo, galleryRef, width, height]);
  useEffect(() => {
    window.addEventListener('resize', scaleImage);
    return () => window.removeEventListener('resize', scaleImage);
  }, [scaleImage]);

  useEffect(() => {
    if (!photo || !lightBox?.current) return;

    if (frame === AnimationFrame.on_gallery) {
      const rect = lightBox.current.getBoundingClientRect();
      setWidth(rect.width);
      setHeight(rect.height);
      setLeft(rect.left);
      setTop(rect.top);

      setTimeout(setFrame, 50, AnimationFrame.to_light_box);
    }

    if (frame === AnimationFrame.to_light_box) {
      scaleImage();
    }

    if (frame === AnimationFrame.off) {
      setWidth(0);
      setHeight(0);
      setLeft(0);
      setTop(0);
      setLightBox();
    }
  }, [frame, lightBox, setLightBox, width, height, photo, scaleImage]);

  return (
    <div
      className={cx(styles['light-box'], { [styles.open]: !!photo })}
      onClick={(e) => {
        if (e.currentTarget === e.target) push({ query: {} });
      }}
      ref={galleryRef}
      role="presentation"
    >
      {photo && (
        <img
          alt="My Post"
          className={cx(styles.photo, {
            [styles.center]: [AnimationFrame.to_light_box, AnimationFrame.on_light_box].includes(
              frame
            ),
            [styles.animating]: [AnimationFrame.to_gallery, AnimationFrame.to_light_box].includes(
              frame
            ),
          })}
          src={photo.url}
          style={{ height: toPx(height), left: toPx(left), top: toPx(top), width: toPx(width) }}
        />
      )}
    </div>
  );
};
